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
        -1.5,-1.0, 1.0,1.0,0.0,0.0,//v2 红色


    ]);
}
