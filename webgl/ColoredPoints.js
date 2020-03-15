var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'attribute float a_Size;\n'+
    'void main() {\n' +
    ' gl_Position = a_Position;\n' +
    // ' gl_PointSize = 10.0;\n' +
    ' gl_PointSize = a_Size;\n' +
    '}\n';
var FSHADER_SOURCE=
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+
    'void main() {\n' +
    //' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '  gl_FragColor=u_FragColor;\n'+
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
    var a_Position=gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position<0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    var a_Size=gl.getAttribLocation(gl.program, 'a_Size');
    if(a_Size<0){
        console.log('Failed to get the storage location of a_Size');
        return;
    }
    var u_FragColor=gl.getUniformLocation(gl.program,'u_FragColor');
    if(!u_FragColor){
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    canvas.onmousedown=function (ev) {
        click(ev,gl,canvas,a_Position,a_Size,u_FragColor);
    }



}

var g_points=[];
var g_Colors=[];
function click(ev,gl,canvas,a_Position,a_Size,u_FragColor) {
    var x=ev.clientX;//鼠标点击处的x坐标
    var y=ev.clientY;
    var rect=ev.target.getBoundingClientRect();
    x=((x-rect.left)-canvas.width/2)/(canvas.width/2);
    y=(canvas.height/2-(y-rect.top))/(canvas.height/2);
    g_points.push([x,y,0.0]);
    // g_points.push(y);
    if(x>=0.0&&y>=0.0){
        g_Colors.push([1.0,0.0,0.0,1.0]);
        // g_Colors.push(0.0);
        // g_Colors.push(0.0);
    }
    else if(x<0.0&&y<0.0){
        g_Colors.push([0.0,1.0,0.0,1.0]);
        // g_Colors.push(1.0);
        // g_Colors.push(0.0);
    }
    else{
        g_Colors.push([1.0,1.0,1.0,1.0]);
        // g_Colors.push(1.0);
        // g_Colors.push(1.0);
    }
   // gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);



    var len=g_points.length;
    for(var i=0;i<len;i++)
    {
        gl.vertexAttrib3fv(a_Position,g_points[i]);
        gl.vertexAttrib1f(a_Size,8.0);
        gl.uniform4fv(u_FragColor,g_Colors[i]);
       // gl.uniform3f(u_FragColor,g_Colors[(i/2)*3],g_Colors[(i/2)*3+1],g_Colors[(i/2)*3+2]);//该语句不行报错
        gl.drawArrays(gl.POINTS,0,1);
    }

}
