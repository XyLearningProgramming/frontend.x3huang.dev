---

title: '[ShaderLab] 让物体光面始终朝向观察者的Lighting Model'
description: "Custom Lighting Model in ShaderLab: Creating a lighting model where object surfaces always face the observer in Unity ShaderLab"
headline: 'Observer-Facing Lighting Model'
date: '2020-08-12T12:00:00'
dateUpdated: ''
published: true
author: 'Xinyu'
tags: ['archive', 'unity']
readTime: 5
---

亮处永远朝向观众，不受环境光影响是有点诡异哦

最近即将上架自己的游戏，却在临门一脚没有推进它的动力。明明只差音效了，加油啊！

所以分散注意力学习一下Unity里面如何用Cg写Shader。虽然以后URP可以用Shader Graph，但是学习一丢丢原理总是好的。所以开一个分类记录几个学来的骚气Shaders。

回归主题，让物体光面朝向自己需要魔改一下Unity内Surface Shader的Lighting Model。核心是让Normal和ViewDir点积，这样越是正面朝向观察者亮度越高即可。下面的Shader用了Ramp Map来实现效果：

```c
0Shader "Custom/MyRamp"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _RampTex("Ramp Texture",2D) = "white"{}
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 200

        CGPROGRAM
        // Physically based Standard lighting model, and enable shadows on all light types
        #pragma surface surf ToonRamp

        // Use shader model 3.0 target, to get nicer looking lighting
        #pragma target 3.0

        sampler2D _MainTex;
        sampler2D _RampTex;

        struct Input
        {
            float2 uv_MainTex;
            float3 viewDir;
        };

        fixed4 _Color;


        // Add instancing support for this shader. You need to check 'Enable Instancing' on materials that use the shader.
        // See https://docs.unity3d.com/Manual/GPUInstancing.html for more information about instancing.
        // #pragma instancing_options assumeuniformscaling
        UNITY_INSTANCING_BUFFER_START(Props)
            // put more per-instance properties here
        UNITY_INSTANCING_BUFFER_END(Props)

        float4 LightingToonRamp(SurfaceOutput o, half3 lightDir, half3 viewDir, half atten)
        {
            float diff = dot(o.Normal, viewDir); // -1, 1
            float h = diff * 0.5 + 0.5; // 0,1
            // smoothstep
            h = smoothstep(0, 1, h);
            float2 rh = h;
            float3 ramp = tex2D(_RampTex, rh).rgb; // mapping to ramp map at diagonal

            float4 c;
            c.rgb = o.Albedo * _LightColor0.rgb * ramp;
            c.a = o.Alpha;
            return c;
        }

        void surf (Input IN, inout SurfaceOutput o)
        {
            //// Albedo comes from a texture tinted by color
            //fixed4 c = tex2D (_MainTex, IN.uv_MainTex) * _Color;
            //o.Albedo = c.rgb;
            
            //// also use ramptex for albedo
            //float NdotV = dot(o.Normal, IN.viewDir);
            //float h = NdotV * 0.5 + 0.5;
            ////// smoothstep
            ////h = smoothstep(0, 1, h);
            //float2 rh = h;
            //fixed4 c = tex2D(_RampTex,rh) * _Color;

            fixed4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;
            o.Albedo = c;
            o.Alpha = c.a;
        }
        ENDCG
    }
    FallBack "Diffuse"
}
```

ZomBunnyFacingMe2
加上Blinn-Phong Reflection以后更加亮瞎

```c
        float4 LightingMyBlinnPhong(SurfaceOutput o, half3 lightDir, half3 viewDir, half atten)
        {
            //// blinn phong reflection model with a halfway vector

            //half3 h = normalize(lightDir + viewDir); // a halfway vector
            //half diff = max(0, dot(o.Normal, lightDir));

            //half nh = max(0, dot(o.Normal, h));
            //half spec = pow(nh, 48);

            //half4 c;
            //c.rgb = (o.Albedo * _LightColor0.rgb * diff + _LightColor0.rgb * spec) * atten ;
            //c.a = o.Alpha;
            //return c;

// my twisted reflection function
            half NdotV = dot(o.Normal, viewDir);// -1, 1
            float h = NdotV * 0.5 + 0.5;
            // smoothstep
            h = smoothstep(0, 1, h);
            float2 rh = h;
            float3 ramp = tex2D(_RampTex, rh).rgb; // mapping to ramp map at diagnol


            half diff = max(0, NdotV);
            half spec = pow(diff,48);
            half4 c;
            c.rgb = (o.Albedo * _LightColor0.rgb * diff + _LightColor0.rgb * spec) * atten * ramp;
            c.a = o.Alpha;
            return c;

        }
```

---

A custom lighting model that ensures object surfaces always appear to face the observer, creating unique visual effects for stylized rendering or special gameplay mechanics.

This technique is particularly useful for:
- Stylized rendering where objects should always appear bright
- UI elements that need consistent visibility
- Special effects that require observer-relative lighting
- Games with unique art styles that break traditional lighting rules

## Implementation Details

The shader modifies the normal calculation to always point toward the camera, ensuring consistent lighting regardless of the object's actual orientation or the light source position.
