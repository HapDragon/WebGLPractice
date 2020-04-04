var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'attribute vec4 a_Color;\n'+
    'uniform mat4 u_mvpMatrix;\n'+
    'varying vec4 v_Color;\n'+
    'attribute float a_Face;\n'+//表面编号（不可使用int类型）
    'uniform int u_PickedFace;\n'+//被选中表面的编号
    'uniform vec3 u_AmbientLight;\n'+//环境光颜色
    'attribute vec4 a_Normal;\n'+//法向量
    'uniform vec3 u_LightColor;\n'+//光线颜色
    'uniform vec3 u_LightDirection;\n'+//光线方向
    'void main() {\n' +
    ' gl_Position = u_mvpMatrix*a_Position;\n' +
    ' int face=int(a_Face);\n'+
    //对法向量进行归一化
    ' vec3 normal = normalize(vec3(a_Normal));\n'+
    //对光线方向进行归一化
    ' vec3 normal_lightDir = normalize(u_LightDirection);\n'+
    //计算光线方向和法向量的点积
    ' float nDotL = max(dot(normal_lightDir, normal),0.0);\n'+
    //计算漫反射光的颜色
    ' vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;\n'+
    //计算环境光产生的反射光颜色
    ' vec3 ambient = u_AmbientLight * vec3(a_Color);\n'+
    ' vec4 colordd=vec4(diffuse+ambient, a_Color.a);\n' +
    ' vec3 color=(face==u_PickedFace)?vec3(1.0):colordd.rgb;\n'+
    ' if(u_PickedFace==0){\n'+
    '   v_Color=vec4(color,a_Face/255.0);\n'+
    ' } else {\n'+
    '   v_Color=vec4(color,colordd.a);\n'+
    ' }\n'+
   // ' v_Color = vec4(diffuse+ambient, a_Color.a);\n' +


   // ' v_Color = vec4(diffuse, a_Color.a);\n' +
    '}\n';
var FSHADER_SOURCE=
    'precision mediump float;\n'+
    'varying vec4 v_Color;\n'+
    'void main() {\n' +
    ' gl_FragColor = v_Color;\n' +
    '}\n';

var currentRotateAngle_Y=0,currentRotateAngle_X=0,currentRotateAngle_Z=0;
var rotateinterval=1;
function main() {
    var canvas=document.getElementById('webgl');
    var gl=getWebGLContext(canvas);
    if(!gl)
    {
        console.log('Failed to get the rendering context for webgl');
        return;
    }
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log('Failed to initialize shader.');
        return;
    }
    //设置顶点坐标和颜色
    var n=initVertexBuffers(gl);
    if(n<0)
    {
        console.log("Failed to set the positions of the vertices");
        return;
    }

    var u_mvpMatrix=gl.getUniformLocation(gl.program,'u_mvpMatrix');
    if(!u_mvpMatrix){
        console.log('Failed to get uniform position of u_mvpMatrix.');
        return;
    }
    var u_PickedFace=gl.getUniformLocation(gl.program,'u_PickedFace');
    if(!u_PickedFace){
        console.log('Failed to get uniform position of u_PickedFace.');
        return;
    }
    gl.uniform1i(u_PickedFace,-1);
    var u_LightColor=gl.getUniformLocation(gl.program,'u_LightColor');
    if(!u_LightColor){
        console.log('Failed to get uniform position of u_LightColor.');
        return;
    }
    var u_LightDirection=gl.getUniformLocation(gl.program,'u_LightDirection');
    if(!u_LightDirection){
        console.log('Failed to get uniform position of u_LightDirection.');
        return;
    }
    var u_AmbientLight=gl.getUniformLocation(gl.program,'u_AmbientLight');
    if(!u_AmbientLight){
        console.log('Failed to get uniform position of u_AmbientLight.');
        return;
    }
    //设置光线颜色
    gl.uniform3f(u_LightColor,1.0,1.0,1.0);
    //设置光线方向
    var lightDirection=new Vector3([0.5,3.0,4.0]);
    //设置环境光颜色
    gl.uniform3f(u_AmbientLight,0.2,0.2,0.2);
    //  lightDirection.normalize();
    gl.uniform3fv(u_LightDirection,lightDirection.elements);
    gl.enable(gl.DEPTH_TEST);//开启深度测试
    gl.clear(gl.DEPTH_BUFFER_BIT);//清空深度缓冲区
    gl.enable(gl.POLYGON_OFFSET_FILL);
    canvas.onmousedown=function(ev){
        var x=ev.clientX;
        var y=ev.clientY;
        var rect=ev.target.getBoundingClientRect();
        if(rect.left<=x&&rect.right>x&&rect.top<=y&&rect.bottom>y){
            var x_in_canvas=x-rect.left;
            var y_in_canvas=rect.bottom-y;
            var face=checkFace(gl,n,x_in_canvas,y_in_canvas,u_mvpMatrix,u_PickedFace);
            gl.uniform1i(u_PickedFace,face);
            draw(gl,n,u_mvpMatrix);
        }
    }
    document.onkeydown=function (ev) {
        keydown(ev);
    }
    var tick=function(){
        draw(gl,n,u_mvpMatrix);
        requestAnimationFrame(tick);
    }
    tick();
   // draw(gl,n,u_mvpMatrix);

}

function draw(gl,n,u_mvpMatrix) {
    //设置视点和可视空间
    var mvpMatrix=new Matrix4();
    mvpMatrix.setPerspective(30,1,1,100);
    //mvpMatrix.lookAt(3,3,7,0,0,0,0,1,0);
    mvpMatrix.lookAt(3,3,7,0,0,0,0,1,0);
    mvpMatrix.rotate(currentRotateAngle_Y,0,1,0).rotate(currentRotateAngle_X,1,0,0).rotate(currentRotateAngle_Z,0,0,1);
    //将模型视图投影矩阵传给u_MvpMatrix
    gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_BYTE,0);
}

function keydown(ev) {
    switch (ev.keyCode) {
        case 37://left
            currentRotateAngle_Y+=rotateinterval;
            break;
        case 38://up
            currentRotateAngle_X+=rotateinterval;
            break;
        case 39://right
            currentRotateAngle_Y-=rotateinterval;
            break;
        case 40://down
            currentRotateAngle_X-=rotateinterval;
            break;
        case 90://Z
            currentRotateAngle_Z+=rotateinterval;
            break;
        case 88://X
            currentRotateAngle_Z-=rotateinterval;
            break;
        default:
            break;
    }
}

function initVertexBuffers(gl) {
    var vertices=new Float32Array([
        //顶点坐标和颜色
        1.0, 1.0, 1.0,//v0
        -1.0, 1.0, 1.0,//v1
        -1.0,-1.0, 1.0,//v2
        1.0, -1.0, 1.0,//v3

        1.0, 1.0, 1.0,//v0
        1.0, -1.0, 1.0,//v3
        1.0, -1.0, -1.0,//v4
        1.0,1.0, -1.0,//v5

        1.0, 1.0, 1.0,//v0
        1.0,1.0, -1.0,//v5
        -1.0, 1.0, -1.0,//v6
        -1.0, 1.0, 1.0,//v1

        -1.0, 1.0, 1.0,//v1
        -1.0, 1.0, -1.0,//v6
        -1.0,-1.0, -1.0,//v7
        -1.0,-1.0, 1.0,//v2

        -1.0,-1.0, -1.0,//v7
        1.0, -1.0, -1.0,//v4
        1.0, -1.0, 1.0,//v3
        -1.0,-1.0, 1.0,//v2

        1.0, -1.0, -1.0,//v4
        -1.0,-1.0, -1.0,//v7
        -1.0, 1.0, -1.0,//v6
        1.0,1.0, -1.0,//v5
    ]);
    var colors=new Float32Array([
        //品红色 前
        1.0,0.0,1.0,
        1.0,0.0,1.0,
        1.0,0.0,1.0,
        1.0,0.0,1.0,
        //黄色 右
        1.0,1.0,0.0,
        1.0,1.0,0.0,
        1.0,1.0,0.0,
        1.0,1.0,0.0,
        //绿色 上
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        //青色 左
        0.0,1.0,1.0,
        0.0,1.0,1.0,
        0.0,1.0,1.0,
        0.0,1.0,1.0,
        //蓝色 下
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        //黑色 右
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
    ]);
    var normals=new Float32Array([
        //前
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,

        //右
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,

        //上
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,

        //左
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,

        //下
        0.0,-1.0,0.0,
        0.0,-1.0,0.0,
        0.0,-1.0,0.0,
        0.0,-1.0,0.0,

        //后
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
    ]);
    var faces=new Uint8Array([//表面编号
        1,1,1,1,//前
        2,2,2,2,//右
        3,3,3,3,//上
        4,4,4,4,//左
        5,5,5,5,//下
        6,6,6,6 //后
     ])
    var vertexcolornormal_indics=new Uint8Array([
        0,1,2,0,2,3,
        4,5,6,4,6,7,
        8,9,10,8,10,11,
        12,13,14,12,14,15,
        16,17,18,16,18,19,
        20,21,22,20,22,23
    ])

    if(!initArrayBuffer(gl,'a_Position',vertices,3,gl.FLOAT))
    {
        return -1;
    }
    if(!initArrayBuffer(gl,'a_Color',colors,3,gl.FLOAT)){
        return -1;
    }
    if(!initArrayBuffer(gl,'a_Normal',normals,3,gl.FLOAT)){
        return -1;
    }
    if(!initArrayBuffer(gl,'a_Face',faces,1,gl.UNSIGNED_BYTE)){
        return  -1;
    }


    var indexBuffer=gl.createBuffer();
    if(!indexBuffer){
        console.log('Failed to create the buffer object ');
        return -1;
    }
    //将顶点索引数据写入缓冲区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,vertexcolornormal_indics,gl.STATIC_DRAW);

    return vertexcolornormal_indics.length;
}

function checkFace(gl,n,x,y,u_mvpMatrix,u_PickedFace) {
    var pixels=new Uint8Array(4);
    gl.uniform1i(u_PickedFace,0);
    draw(gl,n,u_mvpMatrix);
    gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    return pixels[3];
}

function initArrayBuffer(gl,name,vals,num,type) {
    var buffer=gl.createBuffer();
    if(!buffer){
        console.log('Failed to create the buffer object ');
        return -1;
    }
    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    //向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER,vals,gl.STATIC_DRAW);
    var a_Val=gl.getAttribLocation(gl.program,name);
    if(a_Val<0){
        console.log('Failed to get the storage location of '+name);
        return -1;
    }
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Val,num,type,false,0,0);
    //开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Val);
    return true;
}