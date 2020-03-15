var VSHADER_SOURCE=
	'attribute vec4 a_Position;\n'+
	'uniform float u_sinb,u_cosb;\n'+
	// 'attribute float a_Size;\n'+
	'void main() {\n' +
	//' gl_Position = a_Position+u_Translation;\n' +
	' gl_Position.x = a_Position.x*u_cosb-a_Position.y*u_sinb;\n' +
	' gl_Position.y = a_Position.x*u_sinb+a_Position.y*u_cosb;\n' +
	' gl_Position.z = a_Position.z;\n' +
	' gl_Position.w = 1.0;\n' +
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
	var b=Math.PI/2;
	var sinb=Math.sin(b);
	var cosb=Math.cos(b);

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

	var u_sinb=gl.getUniformLocation(gl.program, 'u_sinb');
	if(!u_sinb){
		console.log('Failed to get the storage location of u_sinb');
		return;
	}
	var u_cosb=gl.getUniformLocation(gl.program, 'u_cosb');
	if(u_cosb<0){
		console.log('Failed to get the storage location of u_cosb');
		return;
	}
	gl.uniform1f(u_sinb,sinb);
	gl.uniform1f(u_cosb,cosb);

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


