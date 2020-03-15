var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'attribute vec2 a_TexCoord;\n'+
    'varying vec2 v_TexCoord;\n'+
    'void main() {\n' +
    ' gl_Position = a_Position;\n' +
    ' v_TexCoord = a_TexCoord;\n' +
    '}\n';
var FSHADER_SOURCE=
    'precision mediump float;\n'+
    'uniform sampler2D u_Sampler1;\n'+
	'uniform sampler2D u_Sampler2;\n'+
    'varying vec2 v_TexCoord;\n'+
    'void main() {\n' +
	' vec4 color1= texture2D(u_Sampler1,v_TexCoord);\n' +
	' vec4 color2= texture2D(u_Sampler2,v_TexCoord);\n' +
    //' gl_FragColor = vec4(gl_FragCoord.x/u_Width,0.0,gl_FragCoord.y/u_Height,1.0);\n' +
    ' gl_FragColor = color1*color2;\n' +
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
    if(!initTextures(gl,n)){
        console.log("Failed to initTextures");
        return;
    }

}

function initVertexBuffers(gl) {
    // var verticesTexCoords=new Float32Array([
    //     -0.5,0.5,0.0,1.0,
    //     -0.5,-0.5,0.0,0.0,
    //     0.5,0.5,1.0,1.0,
    //     0.5,-0.5,1.0,0.0
    // ]);
	var verticesTexCoords=new Float32Array([
		-0.5,0.5,0.2,0.85,
		-0.5,-0.5,0.2,0.5,
		0.5,0.5,0.6,0.85,
		0.5,-0.5,0.6,0.5
	]);
    var fsize=verticesTexCoords.BYTES_PER_ELEMENT;
    var n=4;
    //创建缓冲区对象
    var vertexTexCoordBuffer=gl.createBuffer();
    if(!vertexTexCoordBuffer){
        console.log('Failed to create the buffer object ');
        return -1;
    }
    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexTexCoordBuffer);
    //向缓冲区对象写入数据
    //gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER,verticesTexCoords,gl.STATIC_DRAW);
    var a_Position=gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position<0){
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,fsize*4,0);
    //开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord=gl.getAttribLocation(gl.program,'a_TexCoord');
    if(a_TexCoord<0){
        console.log('Failed to get the storage location of a_TexCoord');
        return -1;
    }
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,fsize*4,fsize*2);
    //开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl,n) {
    var texture1=gl.createTexture();
    var texture2=gl.createTexture();
    if(!texture1){
        console.log('Failed to create texture1');
        return;
    }
    if(!texture2){
        console.log('Failed to create texture2');
        return;
    }
    var u_Sampler1=gl.getUniformLocation(gl.program,'u_Sampler1');
    if(!u_Sampler1)
    {
        console.log('Failed to get uniform location of u_Sampler1');
        return;
    }
	var u_Sampler2=gl.getUniformLocation(gl.program,'u_Sampler2');
	if(!u_Sampler2)
	{
		console.log('Failed to get uniform location of u_Sampler2');
		return;
	}
    var image1=new Image();
    image1.onload=function () {
        loadTexture(gl,n,texture1,u_Sampler1,image1,1);
    }
    image1.src='./images/tu.jpg';

	var image2=new Image();
	image2.onload=function () {
		loadTexture(gl,n,texture2,u_Sampler2,image2,2);
	}
	image2.src='./images/802.bmp';
    return true;
}

var g_texUnit1=false;
var g_texUnit2=false;
function loadTexture(gl,n,texture,u_Sampler,image,imagenum) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    if(imagenum==1){
    	gl.activeTexture(gl.TEXTURE0);
    	g_texUnit1=true;
	}
	else{
		gl.activeTexture(gl.TEXTURE1);
		g_texUnit2=true;
	}
    //开启0号纹理单元
    //gl.activeTexture(gl.TEXTURE0);
    //向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D,texture);
    //配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    //配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    //将0号纹理传递给着色器
    gl.uniform1i(u_Sampler,imagenum-1);
    if(g_texUnit1&&g_texUnit2){
		gl.drawArrays(gl.TRIANGLE_STRIP,0,n);
	}

}
