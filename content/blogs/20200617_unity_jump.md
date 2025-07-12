---

title: '[Unity 2D Platform] 如何用Unity的原生物理系统实现更好的跳跃手感？'
description: "Enhanced Jump Mechanics Using Unity Physics: Implementing better jump feel in 2D platformers using Unity's native physics system, inspired by Celeste's mechanics"
headline: 'Better Jump Mechanics in Unity'
date: '2020-06-17T12:00:00'
dateUpdated: ''
published: true
author: 'Xinyu'
tags: ['archive', 'unity']
readTime: 7
---

看到[GMTK总结Celeste跳跃手感如何优秀](https://www.youtube.com/watch?v=yorTG9at90g&ab_channel=GameMaker%27sToolkit)以后，我突然意识到虽然几行代码可以实现跳跃效果，但是操作手感缺实在稀烂。于是我找到了这篇文章，然后用几种方法实现了它们（肯定也有更好的方法）。Unity原生的物理系统虽然很难做到对跳跃达到最高速度和降速的帧级精准控制，但是下面几个小tricks也可以帮助人物的跳跃手感提升不少：

1.跳跃输入容差：“我的跳跃键被吃了？！”


以我自己正在难产的Tile Vania为例，我们想要让人物即使没有完全落地之前（通常只差几帧），就可以正常按下空格键起跳，给玩家一个容错的空间。最普通的

```csharp
bool isOnGround = myCollider2D.IsTouchingLayers(LayerMask.GetMask("Ground"));
```

肯定达不到效果。我用的替代思路是让人物朝脚下RayCast，若距离超过一个定值就判定落地。但仍然有两个小问题：1. 第一次从地面跳跃的次数没有计算；2. 不能时限帧级的落地控制，留给玩家的容错时间随人物落地速度而变化。

```csharp
public bool IsPlayerOnGround()
    {
        int layerMask = (LayerMask.GetMask("Foreground")); // foreground
        RaycastHit2D hit = Physics2D.Raycast(transform.position, Vector2.down, 
Mathf.Infinity, layerMask);
        if (hit.collider != null)
        {
            if (hit.distance <= distanceOfPlayerModelToGround)
            {
                return true;
            }
        }
        return false;
    }
```

第二种增加容差的技巧是实现Coyote Jump / Coyote Time：人物即使晚几帧已掉落平台，也可按下跳跃键。我实习的方法是：1. 固定游戏帧数(也可将代码移动至FixedUpdate()方法内实现)；

2. 记录wasOnGround的状态，然后在Coroutine之内延迟改变isOnGround。如果float jumpCoyoteTime=0.05f;并且float maxFrameRate=60f;那么在帧数跑满的情况下我们就增加了3帧的容错时间。

```csharp
// Coyote Jump
void Awake()
{
        if (limitFrameRate)
        {
            QualitySettings.vSyncCount = 0;
            Application.targetFrameRate = maxFrameRate;
        }
}

void Update()
{
        // make a time slot where players can leave platform for several frames and then jump
        if (wasOnGround == true &amp;&amp; isOnGround == false)
        {
            // start counting the coroutine
            StartCoroutine(CoyoteJumpCoroutine());
        }
        else 
        {
            wasOnGround = isOnGround;
        }
}

    IEnumerator CoyoteJumpCoroutine()
    {
        isOnGround = true;
        yield return new WaitForSeconds(jumpCoyoteTime);
        isOnGround = false;
        wasOnGround = false;
    }
```

3. 即将跳过平台 + 卡在直角边缘：“就差那么一丢丢！”

卡...卡住了
解决2D platform里面人物跳到跳板边缘时候的尴尬情况其实也是在给玩家更大的容错空间。用上下两个2D Box Collider固然可以，但是我们无法在代码中辨别Box Collider哪一个在上，哪一个在下。于是还是用RayCast解决吧：

```csharp
    private void CheckIfStuckByRayAndBoost()
    {
        // if the body stuck in middle wall

        int layerMask = LayerMask.GetMask("Foreground"); // foreground
        Vector2 upperOffsetPosition = transform.position;
        upperOffsetPosition.y += upperBodyRayOffset;
        Vector2 lowerOffsetPosition = transform.position;
        lowerOffsetPosition.y += lowerBodyRayOffset;
        RaycastHit2D upperHitLeft = Physics2D.Raycast(upperOffsetPosition, Vector2.left, detectRangeWhenBodyStucked, layerMask);
        RaycastHit2D upperHitRight = Physics2D.Raycast(upperOffsetPosition, Vector2.right, detectRangeWhenBodyStucked, layerMask);
        RaycastHit2D lowerHitLeft = Physics2D.Raycast(lowerOffsetPosition, Vector2.left, detectRangeWhenBodyStucked, layerMask);
        RaycastHit2D lowerHitRight = Physics2D.Raycast(lowerOffsetPosition, Vector2.right, detectRangeWhenBodyStucked, layerMask);
        isnudging = false;
        bool isnudgingRight = false;
        if (upperHitLeft.collider == null &amp;&amp; lowerHitLeft.collider != null &amp;&amp; Mathf.Approximately(transform.localScale.x, -1f))
        {
            isnudging = true;
        }
        else if (lowerHitRight.collider != null &amp;&amp; upperHitRight.collider == null &amp;&amp; Mathf.Approximately(transform.localScale.x, 1f))
        {
            isnudging = true;
            isnudgingRight = false;
        }

        // when stucked in mid way then detect key input and nudge player slowly up
        if (isnudging==true &amp;&amp; ( Mathf.Abs(Input.GetAxis("Vertical"))>=constantRunningSpeedThreshold || Input.GetButton("Jump"))
            &amp;&amp; curJumpTimes==maxJumpTimes-1)
        {
            Vector2 curSpeed = myRigidBody.velocity;
            curSpeed.y = nudgingUpwardSpeed;
            curSpeed.x = nudgingHorizontalSpeed * (isnudgingRight ? 1 : 0);
            myRigidBody.velocity = curSpeed;
        }

    }
```

思路大体是if (人物头顶的射线没有碰到障碍&&脚底射线碰到障碍的时候&&没有跳跃机会），那么就对人物施加一个向上的速度和贴边的速度，也可用AddForce()来实现。

4. 把控不够，特效来凑：“如果你感觉有点怪，就加点Particle System吧！”

我们可以继续加上：1. 镜头晃动 2. 跳跃时的Particle System 3.人物空中叠影。这些都齐活之后操作起来已经够炫酷啦！

```csharp
// Coroutine to shake virtual camera in Cinemachine.
//Remember to pick the channel perlin object and 6D shake first!
    IEnumerator ShakeCameraCoroutine(float amplitudeGain, float frequencyGain, float shakeTime)
    {
        float formerAmpe = 0f;
        float formerFreq = 0f;
        CinemachineVirtualCamera vcam = GameObject.Find(myCachedCinemachineStateDrivenCam.LiveChild.Name).GetComponent<CinemachineVirtualCamera>();
        CinemachineBasicMultiChannelPerlin noise = vcam.GetCinemachineComponent<CinemachineBasicMultiChannelPerlin>();
        //formerAmpe = noise.m_AmplitudeGain;
        //formerFreq = noise.m_FrequencyGain;
        noise.m_FrequencyGain = frequencyGain;
        noise.m_AmplitudeGain = amplitudeGain;
        yield return new WaitForSeconds(shakeTime);
        noise.m_AmplitudeGain = formerAmpe;
        noise.m_FrequencyGain = formerFreq;
    }
```

此刻[一位靓仔](/games/tile_vania)跳过
