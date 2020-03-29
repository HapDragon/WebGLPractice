var VSHADER_SOURCE=
    'precision mediump float;\n'+
    'attribute vec4 a_Position;\n'+
    'attribute vec4 a_Color;\n'+
    'uniform mat4 u_mvpMatrix;\n'+
    'uniform mat4 u_ModelMatrix;\n'+//模型矩阵
    'varying vec4 v_Color;\n'+
    'attribute vec4 a_Normal;\n'+//法向量
    ' varying vec3 v_Normal;\n'+//法向量传入片源着色器
    'uniform vec3 u_LightColor;\n'+//光线颜色
    // 'uniform vec3 u_LightDirection;\n'+//光线方向在点光源中不再需要，因为在点光源中光线方向是根据点光源位置和顶点位置做差求得
    ' uniform vec3 u_LightPosition;\n'+//光源位置
    ' varying vec3 v_Position;\n'+//顶点的世界坐标，用于逐片源计算光线方向
    'uniform vec3 u_AmbientLight;\n'+//环境光颜色
    'uniform mat4 u_NormalMatrix;\n'+//用来变换法向量的矩阵 平行光下漫反射
    'void main() {\n' +
    ' gl_Position = u_mvpMatrix*a_Position;\n' +
    //对法向量进行归一化
    ' v_Normal = normalize(vec3(u_NormalMatrix*a_Normal));\n'+
    //计算顶点的世界坐标
    ' v_Position=vec3(u_ModelMatrix*a_Position);\n'+
    //对光线方向进行归一化
    // ' vec3 normal_lightDir = normalize(u_LightPosition-vec3(vertexPosition));\n'+
    //计算光线方向和法向量的点积
    // ' float nDotL = max(dot(normal_lightDir, normal),0.0);\n'+
    //计算漫反射光的颜色
    //' vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;\n'+
    //计算环境光产生的反射光颜色
    // ' vec3 ambient = u_AmbientLight * vec3(a_Color);\n'+
    //  ' v_Color = vec4(diffuse+ambient, a_Color.a);\n' +
    ' v_Color=a_Color;\n'+
    '}\n';
var FSHADER_SOURCE=
    'precision mediump float;\n'+
    'varying vec4 v_Color;\n'+
    'varying vec3 v_Normal;\n'+//法向量传入片源着色器
    'uniform vec3 u_LightColor;\n'+//光线颜色
    'uniform vec3 u_LightPosition;\n'+//光源位置
    ' varying vec3 v_Position;\n'+//顶点的世界坐标，用于逐片源计算光线方向
    'uniform vec3 u_AmbientLight;\n'+//环境光颜色
    'void main() {\n' +
    //对法向量进行归一化 因为其内插之后长度不一定是1
    ' vec3 normal = normalize(v_Normal);\n'+
    //对光线方向进行归一化
    ' vec3 normal_lightDir = normalize(u_LightPosition-v_Position);\n'+
    //计算光线方向和法向量的点积
    ' float nDotL = max(dot(normal_lightDir, normal),0.0);\n'+
    //计算漫反射光的颜色
    ' vec3 diffuse = u_LightColor * vec3(v_Color) * nDotL;\n'+
    //计算环境光产生的反射光颜色
    ' vec3 ambient = u_AmbientLight * vec3(v_Color);\n'+
    //  ' v_Color = vec4(diffuse+ambient, a_Color.a);\n' +
    ' gl_FragColor = vec4(diffuse+ambient, v_Color.a);\n' +
    '}\n';


let ANGLE_STEP=3.0;//每次按键旋转角度
let g_arm1Angle=90.0;//arm1的当前角度 上臂
let g_arm2Angle=0.0;//arm2的当前角度 下臂
let g_modelMatrix=new Matrix4();
let g_mvpMatrix=new Matrix4();

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
    var u_ModelMatrix=gl.getUniformLocation(gl.program,'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log('Failed to get uniform position of u_ModelMatrix.');
        return;
    }
    var u_NormalMatrix=gl.getUniformLocation(gl.program,'u_NormalMatrix');
    if(!u_NormalMatrix){
        console.log('Failed to get uniform position of u_NormalMatrix.');
        return;
    }
    var u_LightColor=gl.getUniformLocation(gl.program,'u_LightColor');
    if(!u_LightColor){
        console.log('Failed to get uniform position of u_LightColor.');
        return;
    }
    var u_AmbientLight=gl.getUniformLocation(gl.program,'u_AmbientLight');
    if(!u_AmbientLight){
        console.log('Failed to get uniform position of u_AmbientLight.');
        return;
    }
    var u_LightPosition=gl.getUniformLocation(gl.program,'u_LightPosition');
    if(!u_LightPosition){
        console.log('Failed to get uniform position of u_LightPosition.');
        return;
    }
    //设置点光源颜色
    gl.uniform3f(u_LightColor,1.0,1.0,1.0);
    //设置环境光颜色
    gl.uniform3f(u_AmbientLight,0.2,0.2,0.2);
    //设置点光源位置
    gl.uniform3f(u_LightPosition,0,3.0,4.0);
    gl.enable(gl.DEPTH_TEST);//开启深度测试
    gl.clear(gl.DEPTH_BUFFER_BIT);//清空深度缓冲区
    gl.enable(gl.POLYGON_OFFSET_FILL);
    //设置视点和可视空间
    var mvpMatrix=new Matrix4();
    var modelMatrix=new Matrix4();
    modelMatrix.setTranslate(0,1,0);
    modelMatrix.rotate(90,0,1,0);
    mvpMatrix.setPerspective(30,1,1,100);
    //mvpMatrix.lookAt(3,3,7,0,0,0,0,1,0);
    mvpMatrix.lookAt(3,3,7,0,0,0,0,1,0);
    mvpMatrix.multiply(modelMatrix);
    //将模型视图投影矩阵传给u_MvpMatrix
    gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);
    //模型变换的逆转置矩阵
    var normalMatrix=new Matrix4();
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix,false,normalMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    document.onkeydown=function (ev) {
        keydown(ev,gl,mvpMatrix,u_mvpMatrix,u_ModelMatrix,u_NormalMatrix,n);
    }
    gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_BYTE,0);
}

function initVertexBuffers(gl) {
    var vertices=new Float32Array([
        //顶点坐标和颜色 前
         1.5, 10.0, 1.5,//v0
        -1.5, 10.0, 1.5,//v1
        -1.5, 0.0, 1.5,//v2
         1.5, 0.0, 1.5,//v3

        //右
        1.5, 10.0, 1.5,//v0
        1.5, 0.0, 1.5,//v3
        1.5, 0.0, -1.5,//v4
        1.5,10.0, -1.5,//v5

        //上
        1.5, 10.0, 1.5,//v0
        1.5,10.0, -1.5,//v5
        -1.5, 10.0, -1.5,//v6
        -1.5, 10.0, 1.5,//v1

        //左
        -1.5, 10.0, 1.5,//v1
        -1.5, 10.0, -1.5,//v6
        -1.5,0.0, -1.5,//v7
        -1.5,0.0, 1.5,//v2

        //下
        -1.5,0.0, -1.5,//v7
        1.5, 0.0, -1.5,//v4
        1.5, 0.0, 1.5,//v3
        -1.5,0.0, 1.5,//v2

        //后
        1.5, 0.0, -1.5,//v4
        -1.5,0.0, -1.5,//v7
        -1.5, 10.0, -1.5,//v6
        1.5,10.0, -1.5,//v5
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
        //白色 后
        1.0,1.0,1.0,
        1.0,1.0,1.0,
        1.0,1.0,1.0,
        1.0,1.0,1.0,
    ])
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
function initArrayBuffer(keydowngl,name,vals,num,type) {
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


function keydown(ev,gl,viewProjMatrix,u_mvpMatrix,u_ModelMatrix,u_NormalMatrix,n) {
    switch (ev.keyCode) {
        case 37://左 ->arm1（上臂）绕Y轴正向转动
            if(g_arm1Angle<135.0) {
                //不能让它360°转不然看上去很诡异
                g_arm1Angle+=ANGLE_STEP;
            }
            break;
        case 38://上 ->arm2（下臂）绕Z轴正向转动
            if(g_arm2Angle<135.0) {
                //不能让它360°转不然看上去很诡异
                g_arm2Angle+=ANGLE_STEP;
            }
            break;
        case 39://右 ->arm1（上臂）绕Y轴正向转动
            if(g_arm1Angle>-135.0) {
                //不能让它360°转不然看上去很诡异
                g_arm1Angle-=ANGLE_STEP;
            }
            break;
        case 40://下 ->arm2（下臂）绕Z轴负向转动
            if(g_arm2Angle>-135.0) {
                //不能让它360°转不然看上去很诡异
                g_arm2Angle-=ANGLE_STEP;
            }
            break;
        default:
            return;
    }






    var modelMatrix=new Matrix4();
    modelMatrix.setTranslate(0,1,0);
    modelMatrix.rotate(currentangle,0,1,0);
    var normalMatrix=new Matrix4();
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix,false,normalMatrix.elements);
    //mvpMatrix.lookAt(3,3,7,0,0,0,0,1,0);
    mvpMatrix.lookAt(3,3,7,0,0,0,0,1,0);
    mvpMatrix.multiply(modelMatrix);
    // mvpMatrix.rotate(currentangle,0,1,0);
    //将模型视图投影矩阵传给u_MvpMatrix
    gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_BYTE,0);
}

function draw(gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix) {

}

function drawBox(gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix) {
    //计算模型视图矩阵并传给u_MvpMatrix变量
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix,false,g_mvpMatrix.elements);
}