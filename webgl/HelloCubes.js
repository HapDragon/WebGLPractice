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
}

function initVertexBuffers(gl) {
    var verticesColors=new Float32Array([
        //顶点坐标和颜色
         1.0, 1.0, 1.0,1.0,1.0,1.0,//v0 白色
        -1.0, 1.0, 1.0,1.0,0.0,1.0,//v1 品红色
        -1.5,-1.0, 1.0,1.0,0.0,0.0,//v2 红色


    ]);
}
