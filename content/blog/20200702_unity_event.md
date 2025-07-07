---

title: '[Unity] 什么是c#事件？如何用EventHandler或Action或UnityEvent实现它的功能？'
description: "C# Events in Unity: EventHandler, Action, and UnityEvent: Understanding C# events and implementing them with EventHandler, Action, or UnityEvent in Unity"
headline: 'C# Events Implementation Guide'
date: '2020-07-02T12:00:00'
dateUpdated: ''
published: true
author: 'Xinyu'
tags: ['archive', 'unity']
readTime: 7
---

::VideoEmbed
---
url: "https://www.youtube.com/watch?v=gx0Lt4tCDE0&ab_channel=GameDevGuide"
title: "我要过去啦，开门！"
description: "Unity C# Events demonstration video: Building a custom event system"
---
::

微信公众号？个人邮箱？大字报？塔防里面通知每个小兵更改前进路线？下雨了每个NPC和花花草草要做什么？其实这些都可以称作事件（Events），它们都包含了观察者模型（Observer Design Pattern）的思想。

什么是c#里面的事件呢？事件就是一个对象（Object）通知了某件事发生了（“我发现外星人攻打地球啦！”）。

其中包含事件的类（发布器 Publisher）被我们用来发布事件（联合国报道了我的这条消息），

订阅器（Subscriber）类接收该事件（千千万万个看新闻的人）。它们就是观察者！

c#里面的事件遵循“观察者”模型/设计范式（Observer Design Pattern）。

订阅器之间互不知晓，发布器也不用特别关照某个订阅器，如此一来代码就解耦了。妙啊~

发布器中的事件是由委托定义的对象，符合这个委托声明参数和返回类型的订阅器才可以订阅。本文用来声明事件的EventHandler和Action/Func 本质就是委托/代理（delegate）。以后再开坑。

有大体三个方法可以在Unity中完成事件的发布、响应、触发的功能。有请第一组选手，个人最爱的EventHandler（发布器：DoorWayEvent.cs；订阅器：DoorController.cs；触发：DoorTrigger.cs）:

```csharp
///
/// <summary> DoorWayEvent as Publisher
///
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public class DoorWayEvent: MonoBehaviour
{
//开门
    public event EventHandler<DoorEventsArgs> OnEnterDoor;
//关门
    public event EventHandler<DoorEventsArgs> OnDoorLeave;
//单例
    public static DoorWayEvent instance;

    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
            Destroy(gameObject);
    }
//要开门找我
    public void EnterDoorTrigger(DoorEventsArgs args)
    {
        OnEnterDoor?.Invoke(this, args);
    }
//要关门找我
    public void LeaveDoorTrigger(DoorEventsArgs args)
    {
        OnDoorLeave?.Invoke(this, args);
    }

}
//传参：要开哪个门？
public class DoorEventsArgs : EventArgs
{
    public int id { get; set; }
}

///
/// <summary> DoorController as Subscriber
///
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DoorController : MonoBehaviour
{
    [SerializeField] private int id;
    
    public int ID { get { return id; } set { id = value; } }
    // Start is called before the first frame update
    void Start()
    {
//我订阅啦，有开关门的任何消息就通知我，我知道怎么做。
        DoorWayEvent.instance.OnEnterDoor += OnDoorWayOpen;
        DoorWayEvent.instance.OnDoorLeave += OnDoorWayClose;
    }

//碰到开关门我要这要做...
    private void OnDoorWayOpen(object sender, DoorEventsArgs e)
    {
        //Debug.Log("Trying to Open with id " + e.id);
        //Debug.Log("This Gate with id " + id);
        if (e.id==id)
            LeanTween.moveLocalY(gameObject, transform.position.y+ 2.5f, 1f).setEaseOutQuint();
    }

    private void OnDoorWayClose(object sender, DoorEventsArgs e)
    {
        if(e.id==id)
            LeanTween.moveLocalY(gameObject, transform.position.y-2.5f, 1f).setEaseInQuint();
    }
//门都不在了，我也不再接受信息了。
    private void OnDestroy()
    {
        DoorWayEvent.instance.OnEnterDoor -= OnDoorWayOpen;
        DoorWayEvent.instance.OnDoorLeave -= OnDoorWayClose;
    }
}

///
/// <summary> DoorTrigger
///
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DoorTrigger: MonoBehaviour
{

    private void OnTriggerEnter(Collider other)
    {
        //Debug.Log("Trying to Open "+other.name);
        if (other.gameObject.tag == "Door")
        {
            
            int tarId = other.GetComponent<DoorController>().ID;
            //Debug.Log("Trying to Open with id "+tarId);
            // 通知要开门啦！要开的门是...
            DoorWayEvent.instance.EnterDoorTrigger(new DoorEventsArgs {id=tarId });
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.gameObject.tag == "Door")
        {
            int tarId = other.GetComponent<DoorController>().ID;
            // trigger the event
            DoorWayEvent.instance.LeaveDoorTrigger(new DoorEventsArgs { id = tarId }) ;
        }
    }
}
```

第二组选手Action<>/Func<>加上UnityEvent （发布器 DoorWayEventUsingAction.cs；订阅器 DoorControllerUsingAction.cs；触发DoorTriggerUsingAction.cs）

```csharp
///
/// <summary> DoorWayEventUsingAction as publisher
///
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public class DoorWayEventUsingAction : MonoBehaviour
{
//最重要的事件声明
    public event Action<int> OnDoorWayTriggerEnter;
    public event Action<int> OnDoorWayTriggerLeave;


    public static DoorWayEventUsingAction instance;

    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
            Destroy(gameObject);
    }
//唤起
    public void DoorWayTriggerEnter(int id)
    {
        OnDoorWayTriggerEnter?.Invoke(id);
    }

    public void DoorWayTriggerLeave(int id)
    {
        OnDoorWayTriggerLeave?.Invoke(id);
    }

//一个如何用Func的例子，虽然此处完全不实用
    private Func<List<GameObject>> OnRequestListOfDoors;
    private void Start()
    {
        SetRequestListOfDoors(FindAllDoors);
    }

    private List<GameObject> FindAllDoors()
    {
        List<GameObject> alldoors = new List<GameObject>();
        foreach (var iter in FindObjectsOfType<DoorControllerUsingAction>())
        {
            alldoors.Add(iter.gameObject);
        }
        return alldoors;
    }

    public void SetRequestListOfDoors(Func<List<GameObject>> delegateFunc)
    {
        OnRequestListOfDoors = delegateFunc;
    }
    public List<GameObject> RequestListOfDoors()
    {
        return OnRequestListOfDoors?.Invoke();
    }

// 用 unity event 的例子：如何订阅，唤起
    public UnityEvent unityEvent;

    public void SetThisInActiveIDKWhy()
    {
        gameObject.SetActive(false);
    }

    public void AddListenerMethod()
    {
        unityEvent.AddListener(SetThisInActiveIDKWhy);
    }

    public void InvokeUnityEvent()
    {

        unityEvent.Invoke();
    }

}

///
/// <summary> DoorControllerUsingAction as subcriber
///
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization.Json;
using UnityEngine;

public class DoorControllerUsingAction : MonoBehaviour
{
    [SerializeField] private int id;

    public int ID { get { return id; } set { id = value; } }

    // 订阅方法一模一样
    void Start()
    {
        DoorWayEventUsingAction.instance.OnDoorWayTriggerEnter += 
OnDoorWayOpen;
        DoorWayEventUsingAction.instance.OnDoorWayTriggerLeave += 
OnDoorWayLeave;
    }
//符合Action<int> 传参和返回类型的函数可以用来订阅
    private void OnDoorWayOpen(int id)
    {
        if (id == this.id)
        {
            LeanTween.moveLocalY(gameObject, transform.position.y + 2.5f, 1f).setEaseOutQuint();

            // 如何使用Func 但是此处的例子不实用
            List<GameObject> objs = 
DoorWayEventUsingAction.instance.RequestListOfDoors();
            Debug.Log($"There are {objs.Count} doors in map.");
        }
    }

    private void OnDoorWayLeave(int id)
    {
        if(id==this.id)
            LeanTween.moveLocalY(gameObject, transform.position.y - 2.5f, 1f).setEaseInQuint();
    }
//取消订阅
    private void OnDestroy()
    {
        DoorWayEventUsingAction.instance.OnDoorWayTriggerEnter -= 
OnDoorWayOpen;
        DoorWayEventUsingAction.instance.OnDoorWayTriggerLeave -= 
OnDoorWayLeave;
    }


}

///
/// <summary> DoorTriggerUsingAction as Trigger
///
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DoorTriggerUsingAction : MonoBehaviour
{

    private void OnTriggerEnter(Collider other)
    {
        if (other.tag == "Door")
        {
            DoorWayEventUsingAction.instance.
DoorWayTriggerEnter(other.GetComponent<DoorControllerUsingAction>().ID);
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.tag == "Door")
        {
            DoorWayEventUsingAction.instance.
DoorWayTriggerLeave(other.GetComponent<DoorControllerUsingAction>().ID);
        }
    }
}
```

区别：EventHandler个人觉得还是更加方便，传参的时候要么是EventArgs.Empty 要么是自己定义的派生类。加入或者减少变量不会很麻烦地改变声明内容public event EventHandler<T> SomeEvent；而Action则需要随参数改变声明，虽然也可以写类，但是前者不香么。附[stackoverflow的讨论](https://stackoverflow.com/questions/1431359/event-action-vs-event-eventhandler)。

UnityEvent在编辑模式中有方面的交互界面，有时候直接拖拽也很方便。

简单的实现方法可以是新构建一个类，维持订阅者的名单，再利用代理Call相应的方程。实际上还牵扯反射机制。实现传参和返回类型都是蛮复杂的，改日研究。


虚晃一枪（三枪）XD

---


Events are fundamental to game programming, enabling communication between different systems without tight coupling. Whether it's opening doors, updating UI, broadcasting messages, or coordinating NPC behavior during weather changes, events implement the Observer Design Pattern elegantly.

## Common Event Scenarios

- **Door Systems**: "I'm approaching, open up!" - "Please proceed"
- **Notifications**: WeChat messages, email alerts, bulletin boards
- **Game Mechanics**: Tower defense path updates, weather system responses
- **UI Updates**: Score changes, health modifications, inventory updates

## Implementation Approaches

### 1. EventHandler
Best for simple notifications with standard event patterns.

### 2. Action/Func
Ideal for functional programming approaches and simple callbacks.

### 3. UnityEvent
Perfect for designer-friendly configurations and Inspector-based event binding.

Each approach has its strengths depending on your specific use case and team workflow preferences.
