var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'attribute float a_Size;\n'+
    'void main() {\n' +
    ' gl_Position = a_Position;\n' +
    // ' gl_PointSize = 10.0;\n' +
    ' gl_PointSize = a_Size;\n' +
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
    var a_Position=gl.getAttribLocation(gl.program, 'a_Position');
    var a_Size=gl.getAttribLocation(gl.program, 'a_Size');
    if(a_Position<0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    if(a_Size<0){
        console.log('Failed to get the storage location of a_Size');
        return;
    }
    canvas.onmousedown=function (ev) {
        click(ev,gl,canvas,a_Position,a_Size);
    }
    // gl.vertexAttrib3f(a_Position,0.0,0.0,0.0);
    // gl.vertexAttrib1f(a_Size,10.0);
    //
    // gl.clearColor(0,0,0,1);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    //
    //
    // gl.drawArrays(gl.POINTS,0,1);


}

//var g_points=[];
function click(ev,gl,canvas,a_Position,a_Size) {
    var x=ev.clientX;//鼠标点击处的x坐标
    var y=ev.clientY;
    var rect=ev.target.getBoundingClientRect();
    x=((x-rect.left)-canvas.width/2)/(canvas.width/2);
    y=(canvas.height/2-(y-rect.top))/(canvas.height/2);
    // g_points.push(x);
    // g_points.push(y);
   // gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.vertexAttrib3f(a_Position,x,y,0.0);
    gl.vertexAttrib1f(a_Size,10.0);
    gl.drawArrays(gl.POINTS,0,1);

    // var len=g_points.length;
    // for(var i=0;i<len;i+=2)
    // {
    //     gl.vertexAttrib3f(a_Position,g_points[i],g_points[i+1],0.0);
    //     gl.vertexAttrib1f(a_Size,4.0);
    //     gl.drawArrays(gl.POINTS,0,1);
    // }

}
