var VSHADER_SOURCE=
	'attribute vec4 a_Position;\n'+
	'void main() {\n' +
	' gl_Position = a_Position;\n' +
	' gl_PointSize = 10.0;\n' +
	'}\n';
var FSHADER_SOURCE=
	'precision mediump float;\n'+
	'uniform float u_Width;\n'+
	'uniform float u_Height;\n'+
	'void main() {\n' +
	//' gl_FragColor = vec4(gl_FragCoord.x/u_Width,0.0,gl_FragCoord.y/u_Height,1.0);\n' +
	' gl_FragColor = vec4(0.0,gl_FragCoord.x/u_Width,gl_FragCoord.y/u_Height,1.0);\n' +
	//' gl_FragColor = vec4(gl_FragCoord.x/400.0,0.0,gl_FragCoord.y/400.0,1.0);\n' +
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
	//设置顶点位置
	var n=initVertexBuffers(gl);
	if(n<0)
	{
		console.log("Failed to set the positions of the vertices");
		return;
	}


	var u_Width=gl.getUniformLocation(gl.program, 'u_Width');
	if(!u_Width){
		console.log('Failed to get the storage location of u_Width');
		return;
	}
	gl.uniform1f(u_Width,gl.drawingBufferWidth);
	var u_Height=gl.getUniformLocation(gl.program, 'u_Height');
	if(!u_Height){
		console.log('Failed to get the storage location of u_Height');
		return;
	}
	gl.uniform1f(u_Height,gl.drawingBufferHeight);

	gl.drawArrays(gl.TRIANGLES,0,n);
}

function initVertexBuffers(gl) {
	var vertices=new Float32Array([
		0.0,0.5,
		-0.5,-0.5,
		0.5,-0.5
	]);
	// var sizes=new Float32Array([
	// 	10.0,20.0,50.0
	// ])

	var fsize=vertices.BYTES_PER_ELEMENT;
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
	//gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	if(a_Position<0){
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	//将缓冲区对象分配给a_Position变量
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,fsize*2,0);
	//开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Position);



	return n;
}
