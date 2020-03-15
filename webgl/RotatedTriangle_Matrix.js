var VSHADER_SOURCE=
	'attribute vec4 a_Position;\n'+
	'uniform mat4 u_Matrix1;\n'+
	'uniform mat4 u_Matrix2;\n'+
	// 'attribute float a_Size;\n'+
	'void main() {\n' +
	' gl_Position = u_Matrix2*u_Matrix1*a_Position;\n' +
	// ' gl_Position.x = a_Position.x*u_cosb-a_Position.y*u_sinb;\n' +
	// ' gl_Position.y = a_Position.x*u_sinb+a_Position.y*u_cosb;\n' +
	// ' gl_Position.z = a_Position.z;\n' +
	// ' gl_Position.w = 1.0;\n' +
	' gl_PointSize = 10.0;\n' +
	// ' gl_PointSize = a_Size;\n' +
	'}\n';
var FSHADER_SOURCE=
	'void main() {\n' +
	' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
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
	//绕z轴旋转
	var b=Math.PI/12;
	var sinb=Math.sin(b);
	var cosb=Math.cos(b);

	var rotateMatrix=new Float32Array([
		cosb,sinb,0.0,0.0,
		-sinb,cosb,0.0,0.0,
		0.0,0.0,1.0,0.0,
		0.0,0.0,0.0,1.0
	]);

	//平移矩阵
	var Tx=0.5;
	var Ty=0.3;
	var Tz=0.0;
	var translateMatrix=new Float32Array([
		1.0,0.0,0.0,0.0,
		0.0,1.0,0.0,0.0,
		0.0,0.0,1.0,0.0,
		Tx,Ty,Tz,1.0
	]);
	//缩放矩阵
	var Sx=1.0;
	var Sy=1.5;
	var Sz=1.0;
	var sizableMatrix=new Float32Array([
		Sx,0.0,0.0,0.0,
		0.0,Sy,0.0,0.0,
		0.0,0.0,Sz,0.0,
		0.0,0.0,0.0,1.0
	])
	//单位矩阵
	var unitMatrix=new Float32Array([
		1.0,0.0,0.0,0.0,
		0.0,1.0,0.0,0.0,
		0.0,0.0,1.0,0.0,
		0.0,0.0,0.0,1.0
	])
	//以下注释为说明可以传attribute参数
	// var a_sinb=gl.getAttribLocation(gl.program, 'a_sinb');
	// if(a_sinb<0){
	// 	console.log('Failed to get the storage location of a_sinb');
	// 	return;
	// }
	// var a_cosb=gl.getAttribLocation(gl.program, 'a_cosb');
	// if(a_cosb<0){
	// 	console.log('Failed to get the storage location of a_cosb');
	// 	return;
	// }
	// gl.vertexAttrib1f(a_sinb,sinb);
	// gl.vertexAttrib1f(a_cosb,cosb);

	var u_Matrix1=gl.getUniformLocation(gl.program, 'u_Matrix1');
	if(!u_Matrix1){
		console.log('Failed to get the storage location of u_Matrix1');
		return;
	}
	var u_Matrix2=gl.getUniformLocation(gl.program, 'u_Matrix2');
	if(!u_Matrix2){
		console.log('Failed to get the storage location of u_Matrix2');
		return;
	}
	//先旋转再平移
	// gl.uniformMatrix4fv(u_Matrix1,false,rotateMatrix);
	// gl.uniformMatrix4fv(u_Matrix2,false,translateMatrix);
	//先平移再旋转
	// gl.uniformMatrix4fv(u_Matrix1,false,translateMatrix);
	// gl.uniformMatrix4fv(u_Matrix2,false,rotateMatrix);
	//先平移再平移
	gl.uniformMatrix4fv(u_Matrix1,false,translateMatrix);
	gl.uniformMatrix4fv(u_Matrix2,false,translateMatrix);
	//先旋转再旋转
	// gl.uniformMatrix4fv(u_Matrix1,false,rotateMatrix);
	// gl.uniformMatrix4fv(u_Matrix2,false,rotateMatrix);
	gl.uniformMatrix4fv(u_Matrix1,false,translateMatrix);
	gl.uniformMatrix4fv(u_Matrix2,false,sizableMatrix);

	gl.clearColor(0,0,0,1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.TRIANGLES,0,n);
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


