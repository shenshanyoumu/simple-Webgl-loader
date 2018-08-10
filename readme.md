### 开源的 obj 加载器

> 本 obj 加载器主要是给初中级 WebGl 学习者完善

### 文件内容

- lib:数学库函数，和 obj 加载没有直接关系，但是在 WebGl 种很有用
- src:带有注释的项目源代码
- example:使用实例

### 详细使用说明

展示 1 个 obj 只需要一行代码:

```
readOBJFile('./models/cube.obj', modelObject, mtlArray, objArray, 20, false, 0);
```

再添加 1 个纹理只需要两行代码:

```
readOBJFile('./models/cube.obj', modelObject, mtlArray, objArray, 20, false, 0);
TextureArray[0]={ifTexture:0.0,TextureUrl:'none',n:0};
```

改变透明度、默认颜 、缩放、旋转、方位、只需要三行代码:

```
readOBJFile('./models/cube.obj', modelObject, mtlArray, objArray, 20, false, 0);
TextureArray[0]={ifTexture:0.0,TextureUrl:'none',n:0};
updateDrawInfo(0,[0.0,90.0,0.0, 0.0,6.0,0.0, 0.75,0.4,0.5,   0.5,0.5,0.5,1,0 ,1]);
```

注：关于第三种各个参数的位置，可以直接查看 updateDrawInfo 函数：

```
function updateDrawInfo(index,someDrawInfo){
    if(!modelDrawInfo[index])
        modelDrawInfo[index]={};

    //旋转参数
    modelDrawInfo[index].rotateX=someDrawInfo[0];
    modelDrawInfo[index].rotateY=someDrawInfo[1];
    modelDrawInfo[index].rotateZ=someDrawInfo[2];

    //位置参数
    modelDrawInfo[index].offsetX=someDrawInfo[3];
    modelDrawInfo[index].offsetY=someDrawInfo[4];
    modelDrawInfo[index].offsetZ=someDrawInfo[5];

    //缩放参数
    modelDrawInfo[index].scaleX=someDrawInfo[6];
    modelDrawInfo[index].scaleY=someDrawInfo[7];
    modelDrawInfo[index].scaleZ=someDrawInfo[8];

    //自定义颜色参数
    modelDrawInfo[index].r=someDrawInfo[9];
    modelDrawInfo[index].g=someDrawInfo[10];
    modelDrawInfo[index].b=someDrawInfo[11];
    modelDrawInfo[index].a=someDrawInfo[12];
    modelDrawInfo[index].u_ifCertainColor=someDrawInfo[13];

    //是否隐藏
    modelDrawInfo[index].ifShow=someDrawInfo[14];

}
```

关于具体的使用方式，我已经给出了详细的例子，在 example 文件夹下的 computerRoom.html 和 computerRoom.js 中。

_解释权归个人所有，联系方式:networknxt@gmail.com_

### 协议

MIT
