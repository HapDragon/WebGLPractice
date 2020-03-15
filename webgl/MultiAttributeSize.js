var VSHADER_SOURCE=
	'attribute vec4 a_Position;\n'+
	'attribute float a_PointSize;\n'+
	'attribute vec4 a_PointColor;\n'+
	'varying vec4 v_PointColor;\n'+
	'void main() {\n' +
	' gl_Position = a_Position;\n' +
	' gl_PointSize = a_PointSize;\n' +
	' v_PointColor = a_PointColor;\n' +
	'}\n';
var FSHADER_SOURCE=
	'precision mediump float;\n'+
	'varying vec4 v_PointColor;\n'+
	'void main() {\n' +
	' gl_FragColor = v_PointColor;\n' +
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
	gl.drawArrays(gl.TRIANGLES,0,n);
}

function initVertexBuffers(gl) {
	// var vertices=new Float32Array([
	// 	0.0,0.5,
	// 	-0.5,-0.5,
	// 	0.5,-0.5
	// ]);
	// var sizes=new Float32Array([
	// 	10.0,20.0,50.0
	// ])
	var verticeSizeColors=new Float32Array([
			0.0,0.5,10.0,1.0,0.0,0.0,
			-0.5,-0.5,70.0,0.0,1.0,0.0,
			0.5,-0.5,30.0,0.0,0.0,1.0
	])
	var fsize=verticeSizeColors.BYTES_PER_ELEMENT;
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
	gl.bufferData(gl.ARRAY_BUFFER,verticeSizeColors,gl.STATIC_DRAW);
	var a_Position=gl.getAttribLocation(gl.program,'a_Position');
	if(a_Position<0){
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	//将缓冲区对象分配给a_Position变量
	// gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,fsize*6,0);
	//开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Position);

	// var sizeBuffer=gl.createBuffer();
	// if(!sizeBuffer){
	// 	console.log('Failed to create the buffer object ');
	// 	return -1;
	// }
	// gl.bindBuffer(gl.ARRAY_BUFFER,sizeBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER,sizes,gl.STATIC_DRAW);
	var a_PointSize=gl.getAttribLocation(gl.program,'a_PointSize');
	if(a_PointSize<0){
		console.log('Failed to get the storage location of a_PointSize');
		return -1;
	}
	gl.vertexAttribPointer(a_PointSize,1,gl.FLOAT,false,fsize*6,fsize*2);
	gl.enableVertexAttribArray(a_PointSize);

	var a_PointColor=gl.getAttribLocation(gl.program,'a_PointColor');
	if(a_PointColor<0){
		console.log('Failed to get the storage location of a_PointColor');
		return -1;
	}
	gl.vertexAttribPointer(a_PointColor,3,gl.FLOAT,false,fsize*6,fsize*3);
	gl.enableVertexAttribArray(a_PointColor);
	return n;
}
