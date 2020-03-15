var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'uniform mat4 u_Matrix;\n'+
    // 'attribute float a_Size;\n'+
    'void main() {\n' +
    ' gl_Position = u_Matrix*a_Position;\n' +
    '}\n';
var FSHADER_SOURCE=
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

let currentangle=0;
let g_lasttime=Date.now();
let rotatespeed=105;//每秒旋转多少度

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
    //设置顶点位置
    var n=initVertexBuffers(gl);
    if(n<0)
    {
        console.log("Failed to set the positions of the vertices");
        return;
    }
    var u_Matrix=gl.getUniformLocation(gl.program, 'u_Matrix');
    if(!u_Matrix){
        console.log('Failed to get the storage location of u_Matrix');
        return;
    }

    var tick=function(){
       animate();
        //绕z轴旋转
        var rotateformMatrix=new Matrix4();
         rotateformMatrix.setTranslate(0.35,0,0);
         rotateformMatrix.rotate(currentangle,0,0,1);
        //rotateformMatrix.setRotate(currentangle,0,0,1);
        rotateformMatrix.translate(0.35,0.0,0.0);
        gl.uniformMatrix4fv(u_Matrix,false,rotateformMatrix.elements);

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES,0,n);
        requestAnimationFrame(tick);

        //不能直接调用的原因是直接调用会产生递归栈，所有层次的调用都会保存在系统内存中最终造成内存满
       // tick();
    }

   tick();
}

function initVertexBuffers(gl) {
    var vertices=new Float32Array([
        0.0,0.5,-0.5,-0.5,0.5,-0.5
    ]);
    var n=3;
    //创建缓冲区对象
    var vertexBuffer=gl.createBuffer();
    if(!vertexBuffer){
        console.log('Failed to create the buffer object ');
        return -1;
    }
    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    //向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

    var a_Position=gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position<0){
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
    //开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);
    return n;
}

function animate() {
	let nowtime=Date.now();
	var elapse=nowtime-g_lasttime;
	g_lasttime=nowtime;
	currentangle+=rotatespeed*elapse/1000.0;
	currentangle%=360;
	// currentangle+=2;
}

function speedup() {
    rotatespeed+=10;
}
function speeddown() {
    rotatespeed-=10;
}






