var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'attribute vec4 a_Color;\n'+
    'uniform mat4 u_mvpMatrix;\n'+
    'varying vec4 v_Color;\n'+
    'void main() {\n' +
    ' gl_Position = u_mvpMatrix*a_Position;\n' +
    ' v_Color = a_Color;\n' +
    '}\n';
var FSHADER_SOURCE=
    'precision mediump float;\n'+
    'varying vec4 v_Color;\n'+
    'void main() {\n' +
    ' gl_FragColor = v_Color;\n' +
    '}\n';

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
	gl.enable(gl.DEPTH_TEST);//开启深度测试
	gl.clear(gl.DEPTH_BUFFER_BIT);//清空深度缓冲区
	gl.enable(gl.POLYGON_OFFSET_FILL);
	//设置视点和可视空间
	var mvpMatrix=new Matrix4();
	mvpMatrix.setPerspective(30,1,1,100);
	mvpMatrix.lookAt(3,3,7,0,0,0,0,1,0);
	//将模型视图投影矩阵传给u_MvpMatrix
	gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_BYTE,0);
}

function initVertexBuffers(gl) {
    var verticesColors=new Float32Array([
        //顶点坐标和颜色
         1.0, 1.0, 1.0,1.0,1.0,1.0,//v0 白色
        -1.0, 1.0, 1.0,1.0,0.0,1.0,//v1 品红色
        -1.0,-1.0, 1.0,1.0,0.0,0.0,//v2 红色
		1.0, -1.0, 1.0,1.0,1.0,0.0,//v3 黄色
		1.0, -1.0, -1.0,0.0,1.0,0.0,//v4 绿色
		1.0,1.0, -1.0,0.0,1.0,1.0,//v5 青色
		-1.0, 1.0, -1.0,0.0,0.0,1.0,//v6 蓝色
		-1.0,-1.0, -1.0,0.0,0.0,0.0,//v7 黑色
    ]);
    var indices=new Uint8Array([
    	0,1,2,0,2,3,//前
		0,3,4,0,4,5,//右
		0,1,6,0,5,6,//上
		1,6,7,1,2,7,//左
		2,7,4,2,4,3,//下
		5,6,7,5,7,4//后
	]);
    //创建缓冲区对象
	var vertexColorBuffer=gl.createBuffer();
	if(!vertexColorBuffer){
		console.log('Failed to create the buffer object ');
		return -1;
	}
	var indexBuffer=gl.createBuffer();
	if(!indexBuffer){
		console.log('Failed to create the buffer object ');
		return -1;
	}
	//将缓冲区对象绑定到目标
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexColorBuffer);
	//向缓冲区对象写入数据
	gl.bufferData(gl.ARRAY_BUFFER,verticesColors,gl.STATIC_DRAW);
	var FSIZE=verticesColors.BYTES_PER_ELEMENT;
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	if(a_Position<0){
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	//将缓冲区对象分配给a_Position变量
	gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,FSIZE*6,0);
	//开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Position);

	var a_Color=gl.getAttribLocation(gl.program,'a_Color');
	if(a_Color<0){
		console.log('Failed to get the storage location of a_Color');
		return -1;
	}
	//将缓冲区对象分配给a_Position变量
	gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
	//开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Color);

	//将顶点索引数据写入缓冲区对象
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);

	return indices.length;
}
