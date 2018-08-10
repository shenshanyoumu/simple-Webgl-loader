WebGLUtils = (function() {
  var makeFailHTML = function(msg) {
    // 返回错误信息的DIV元素
    return (
      '' +
      '<div style="margin: auto; width:500px;z-index:10000;margin-top:20em;text-align:center;">' +
      msg +
      '</div>'
    );

    // table形式的错误信息显示
    return (
      '' +
      '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
      '<td align="center">' +
      '<div style="display: table-cell; vertical-align: middle;">' +
      '<div style="">' +
      msg +
      '</div>' +
      '</div>' +
      '</td></tr></table>'
    );
  };

  // 当浏览器不支持WebGL时显示的信息
  var GET_A_WEBGL_BROWSER =
    '' +
    'This page requires a browser that supports WebGL.<br/>' +
    '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

  //当计算机硬件资源不支持WebGL时提示信息
  var OTHER_PROBLEM =
    '' +
    "It doesn't appear your computer can support WebGL.<br/>" +
    '<a href="http://get.webgl.org">Click here for more information.</a>';

  var setupWebGL = function(canvas, opt_attribs, opt_onError) {
    // 创建错误信息的函数
    function handleCreationError(msg) {
      var container = document.getElementsByTagName('body')[0];

      if (container) {
        // 当浏览器支持WebGLRenderingContext属性，则说明硬件不支持
        var str = window.WebGLRenderingContext
          ? OTHER_PROBLEM
          : GET_A_WEBGL_BROWSER;
        if (msg) {
          str += '<br/><br/>Status: ' + msg;
        }

        // innerHTML是一种JS的书写方式，在WebPack中所有资源都当作JS模块的原因就是JS可以实现HTML和CSS等功能
        container.innerHTML = makeFailHTML(str);
      }
    }

    opt_onError = opt_onError || handleCreationError;

    // 如果canvas对象具有事件监听器功能，则处理下面
    if (canvas.addEventListener) {
      canvas.addEventListener(
        'webglcontextcreationerror',
        function(event) {
          opt_onError(event.statusMessage);
        },
        false
      );
    }

    // 利用canvas对象创建WebGL上下文对象
    var context = create3DContext(canvas, opt_attribs);
    if (!context) {
      if (!window.WebGLRenderingContext) {
        opt_onError('');
      } else {
        opt_onError('');
      }
    }

    return context;
  };

  var create3DContext = function(canvas, opt_attribs) {
    var names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
      try {
        // 浏览器canvas对象创建WebGL上下文对象
        context = canvas.getContext(names[ii], opt_attribs);
      } catch (e) {}
      if (context) {
        break;
      }
    }
    return context;
  };

  return {
    create3DContext: create3DContext,
    setupWebGL: setupWebGL
  };
})();

// requestAnimationFrame比setInterval好的地方在于可以根据浏览器实现自动调整屏幕渲染频率，并且当页面隐藏时该函数不会继续执行
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function() // 近似实现的requestAnimationFrame
      {
        window.setInterval(callback, 1000 / 60);
      }
    );
  })();
}

// 清除
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame =
    window.cancelRequestAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.clearTimeout;
}
