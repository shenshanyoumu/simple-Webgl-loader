// 字符串解析器，str存储字符串，而index时解析过程中保存的index
var StringParser = function(str) {
  this.str = null; // Store the string specified by the argument
  this.index = 0; // Position in the string to be processed
  this.init(str);
};

// 初始化字符串解析器
StringParser.prototype.init = function(str) {
  this.str = str;
  this.index = 0;
};

// 跳过字符串前面的制表符、空格和圆括号符号等
StringParser.prototype.skipDelimiters = function() {
  for (var i = this.index, len = this.str.length; i < len; i++) {
    var c = this.str.charAt(i);
    // Skip TAB, Space, '(', ')
    if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
    break;
  }
  this.index = i;
};

//下一个单词开始索引
StringParser.prototype.skipToNextWord = function() {
  this.skipDelimiters();
  var n = getWordLength(this.str, this.index);
  this.index += n + 1;
};

// 获得字符串中的单词
StringParser.prototype.getWord = function() {
  this.skipDelimiters();
  var n = getWordLength(this.str, this.index);
  if (n == 0) return null;
  var word = this.str.substr(this.index, n);
  this.index += n + 1;

  return word;
};

// 字符串中单词表示Integer格式
StringParser.prototype.getInt = function() {
  return parseInt(this.getWord());
};

// 字符串中单词表示Float格式
StringParser.prototype.getFloat = function() {
  return parseFloat(this.getWord());
};

// 根据给定开始索引，计算下一个单词的长度
function getWordLength(str, start) {
  var n = 0;
  for (var i = start, len = str.length; i < len; i++) {
    var c = str.charAt(i);
    if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') break;
  }
  return i - start;
}

// MTLDoc对象，这是模型的一种存储结构
var MTLDoc = function() {
  this.complete = false; // MTL is configured correctly
  this.materials = new Array(0);
};

MTLDoc.prototype.parseNewmtl = function(sp) {
  return sp.getWord(); // Get name
};

// 材质的颜色和透明度
MTLDoc.prototype.parseRGB = function(sp, name) {
  var r = sp.getFloat();
  var g = sp.getFloat();
  var b = sp.getFloat();
  return new Material(name, r, g, b, 1);
};

//------------------------------------------------------------------------------
// 材质对象
//------------------------------------------------------------------------------
var Material = function(name, r, g, b, a) {
  this.name = name;
  this.color = new Color(r, g, b, a);
};

//------------------------------------------------------------------------------
// 顶点对象
//------------------------------------------------------------------------------
var Vertex = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};

//------------------------------------------------------------------------------
// 纹理顶点对象
//------------------------------------------------------------------------------
var VTertex = function(x, y) {
  this.x = x;
  this.y = y;
};

//------------------------------------------------------------------------------
// 法向量对象
//------------------------------------------------------------------------------
var Normal = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};

//------------------------------------------------------------------------------
// 颜色对象
//------------------------------------------------------------------------------
var Color = function(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

//------------------------------------------------------------------------------
// OBJObject Object
//------------------------------------------------------------------------------
var OBJObject = function(name) {
  this.name = name;
  this.faces = new Array(0);
  this.numIndices = 0;
};

// OBJObject对象增加一个面对象，同时将面对象的索引数添加
OBJObject.prototype.addFace = function(face) {
  this.faces.push(face);
  this.numIndices += face.numIndices;
};

//------------------------------------------------------------------------------
// Face Object
//------------------------------------------------------------------------------
var Face = function(materialName) {
  this.materialName = materialName || '';
  this.vIndices = new Array(0);
  this.nIndices = new Array(0);
  this.tIndices = new Array(0); // 用来记录纹理坐标
};

//------------------------------------------------------------------------------
// DrawInfo Object
//------------------------------------------------------------------------------
var DrawingInfo = function(vertices, normals, colors, indices, textureVt) {
  this.vertices = vertices;
  this.normals = normals;
  this.colors = colors;
  this.indices = indices;
  this.textureVt = textureVt;
};

//这个函数目前还是需要的，其实OBJ文件格式比下面复杂很多。
// 下面只是包含材质、模型分组对象、顶点和顶点法向量
var OBJDoc = function(fileName) {
  this.fileName = fileName;
  this.mtls = new Array(0);
  // 模型可能由多个部分组成，因此每个组成是一个对象
  this.objects = new Array(0);

  this.vertices = new Array(0); // Initialize the property for Vertex
  this.normals = new Array(0); // Initialize the property for Normal

  //Add vertice for texture
  this.textureVt = new Array(0);
};

//返回材质库路径
function parseMtllib(sp, fileName) {
  var i = fileName.lastIndexOf('/');
  var dirPath = '';
  if (i > 0) {
    dirPath = fileName.substr(0, i + 1);
  }

  return dirPath + sp.getWord(); // Get path
}

function parseObjectName(sp) {
  var name = sp.getWord();
  return new OBJObject(name);
}

// 在具有尺度变换前提下的顶点对象构造
function parseVertex(sp, scale) {
  var x = sp.getFloat() * scale;
  var y = sp.getFloat() * scale;
  var z = sp.getFloat() * scale;
  return new Vertex(x, y, z);
}

// 二维顶点对象构造
function parseVTertex(sp, scale) {
  var x = sp.getFloat() * scale;
  var y = sp.getFloat() * scale;
  return new VTertex(x, y);
}

// 法向量
function parseNormal(sp) {
  var x = sp.getFloat();
  var y = sp.getFloat();
  var z = sp.getFloat();
  return new Normal(x, y, z);
}

function parseUsemtl(sp) {
  return sp.getWord();
}

var iiii = 1;

// 解析face对象
function parseFace(sp, materialName, vertices, textureVt, Normals, reverse) {
  var face = new Face(materialName);
  // get indices
  for (;;) {
    // 如果不能解析出单词则退出循环
    var word = sp.getWord();
    if (!word || !word.replace(/^\s+|\s+$/g, '')) break;

    //注意在OBJ文件中，f 1/2/3 3/4/4 这种形式表示场景模型中的面。并且由"/"分割的数字分别表示顶点、纹理顶点和法向量的索引
    var subWords;
    subWords = word.split('/');

    if (subWords.length >= 1) {
      var vi =
        parseInt(subWords[0]) < 0
          ? vertices.length + parseInt(subWords[0])
          : parseInt(subWords[0]) - 1;

      if (iiii < 4) {
        console.log(
          vi,
          'vi',
          parseInt(subWords[0]),
          subWords,
          word,
          word.replace(/^\s+|\s+$/g, '')
        );
      }

      face.vIndices.push(vi);
    }

    if (subWords.length >= 2) {
      if (subWords[1]) {
        var ti =
          parseInt(subWords[1]) < 0
            ? textureVt.length + parseInt(subWords[1])
            : parseInt(subWords[1]) - 1;
        face.tIndices.push(ti);
      }
    }

    if (subWords.length >= 3) {
      var ni =
        parseInt(subWords[2]) < 0
          ? Normals.length + parseInt(subWords[2])
          : parseInt(subWords[2]) - 1;
      face.nIndices.push(ni);
    } else {
      face.nIndices.push(-1);
    }
  }

  if (iiii < 4) {
    console.log(
      face.vIndices,
      'face.vIndices',
      vertices[face.vIndices[0]],
      vertices[face.vIndices[1]],
      vertices[face.vIndices[2]]
    );
  }

  var v0 = [
    vertices[face.vIndices[0]].x,
    vertices[face.vIndices[0]].y,
    vertices[face.vIndices[0]].z
  ];
  var v1 = [
    vertices[face.vIndices[1]].x,
    vertices[face.vIndices[1]].y,
    vertices[face.vIndices[1]].z
  ];
  var v2 = [
    vertices[face.vIndices[2]].x,
    vertices[face.vIndices[2]].y,
    vertices[face.vIndices[2]].z
  ];

  //这个其实没有什么用，留着以后删除吧
  var t1, t2, t3;

  if (face.tIndices.length >= 3) {
    if (!textureVt[face.tIndices[0]]) {
      console.log(
        'textureVt.length:',
        textureVt.length,
        'face.tIndices[0]',
        face.tIndices,
        'face.tIndices.length',
        face.tIndices.length
      );
      throw 'hhhh';
    }
    // 纹理顶点
    t1 = [textureVt[face.tIndices[0]].x, textureVt[face.tIndices[0]].y];
    t2 = [textureVt[face.tIndices[1]].x, textureVt[face.tIndices[1]].y];
    t3 = [textureVt[face.tIndices[2]].x, textureVt[face.tIndices[2]].y];
  }
  // 计算法向量
  var normal = calcNormal(v0, v1, v2);
  // 法線が正しく求められたか調べる
  if (normal == null) {
    if (face.vIndices.length >= 4) {
      // 面が四角形なら別の3点の組み合わせで法線計算
      var v3 = [
        vertices[face.vIndices[3]].x,
        vertices[face.vIndices[3]].y,
        vertices[face.vIndices[3]].z
      ];
      normal = calcNormal(v1, v2, v3);
    }
    if (normal == null) {
      // 法線が求められなかったのでY軸方向の法線とする
      normal = [0.0, 1.0, 0.0];
    }
  }
  if (reverse) {
    normal[0] = -normal[0];
    normal[1] = -normal[1];
    normal[2] = -normal[2];
  }
  face.normal = new Normal(normal[0], normal[1], normal[2]);
  face.textureVt = [t1, t2, t3];

  // Devide to triangles if face contains over 3 points.
  if (face.vIndices.length > 3) {
    var n = face.vIndices.length - 2;
    var newVIndices = new Array(n * 3);
    var newNIndices = new Array(n * 3);
    var newTIndices = new Array(n * 3);
    for (var i = 0; i < n; i++) {
      newVIndices[i * 3] = face.vIndices[0];
      newVIndices[i * 3 + 1] = face.vIndices[i + 1];
      newVIndices[i * 3 + 2] = face.vIndices[i + 2];
      newNIndices[i * 3] = face.nIndices[0];
      newNIndices[i * 3 + 1] = face.nIndices[i + 1];
      newNIndices[i * 3 + 2] = face.nIndices[i + 2];
      newTIndices[i * 3] = face.tIndices[0];
      newTIndices[i * 3 + 1] = face.tIndices[i + 1];
      newTIndices[i * 3 + 2] = face.tIndices[i + 2];
    }
    face.vIndices = newVIndices;
    face.nIndices = newNIndices;
    face.tIndices = newTIndices;
    if (iiii < 4) console.log('face.vIndices', face.vIndices);
  }
  face.numIndices = face.vIndices.length;

  iiii++;

  return face;
}

function onReadMTLFile(fileString, mtl, modelObject, index, mtlArray) {
  var lines = fileString.split('\n'); // Break up into lines and store them as array
  lines.push(null); // Append null
  var tempindex = 0; // Initialize index of line

  // Parse line by line
  var line; // A string in the line to be parsed
  var name = ''; // Material name
  var sp = new StringParser(); // Create StringParser
  while ((line = lines[tempindex++]) != null) {
    sp.init(line); // init StringParser
    var command = sp.getWord(); // Get command
    if (command == null) continue; // check null command

    switch (command) {
      case '#':
        continue; // Skip comments
      case 'newmtl': // Read Material chunk
        name = mtl.parseNewmtl(sp); // Get name
        continue; // Go to the next line
      case 'Kd': // Read normal
        if (name == '') continue; // Go to the next line because of Error
        var material = mtl.parseRGB(sp, name);
        mtl.materials.push(material);
        name = '';
        continue; // Go to the next line
    }
  }
  mtl.complete = true;

  var tempii = 0,
    templock = false;
  console.log('modelObject[index]', modelObject[index].mtls);
  for (; tempii < modelObject[index].mtls.length; tempii++) {
    if (!!modelObject[index].mtls[tempii]) {
      templock = true;
    }
  }
  mtlArray[index] = templock;
  console.log(templock, mtlArray);
  //直接这样好像还不太行...?
}

function OBJDocparser(
  fileString,
  modelObject,
  mtlArray,
  objArray,
  scale,
  reverse,
  index
) {
  var lines = fileString.split('\n'); // Break up into lines and store them as array
  lines.push(null); // Append null
  var tempIndex = 0; // Initialize index of line

  var currentObject = null; //理解为一个代号?
  var currentMaterialName = '';
  var ifmtl = false;

  // Parse line by line
  var line; // A string in the line to be parsed
  var sp = new StringParser(); // Create StringParser
  while ((line = lines[tempIndex++]) != null) {
    sp.init(line); // init StringParser
    var command = sp.getWord(); // Get command
    if (command == null) continue; // check null command

    switch (command) {
      case '#':
        continue; // Skip comments
      case 'mtllib':
        ifmtl = true; // Read Material chunk
        var path = parseMtllib(sp, this.fileName);
        var mtl = new MTLDoc(); // Create MTL instance
        this.mtls.push(mtl);
        console.log(this.mtls, ':this.mtls', modelObject[index].mtls);
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
          if (request.readyState == 4) {
            if (request.status != 404) {
              onReadMTLFile(
                request.responseText,
                mtl,
                modelObject,
                index,
                mtlArray
              );
            } else {
              mtlArray[index] = !modelObject[index].mtls.some(function(x) {
                return !x;
              });
              console.log('need a mtlib, but there is none', mtlArray[index]);
              mtl.complete = true;
            }
          }
        };
        request.onerror = function(error) {
          console.log(error);
        };
        request.ontimeout = function(error) {
          console.log('timeout', error);
        };
        request.open('GET', path, true); // Create a request to acquire the file
        request.send();
        continue; // Go to the next line
      case 'o':
      case 'g': // Read Object name
        var object = parseObjectName(sp);
        this.objects.push(object);
        currentObject = object;
        //这是一个浅复制，可以简单地认为和object指向同一块内容
        continue; // Go to the next line
      case 'v': // Read vertex
        var vertex = parseVertex(sp, scale);
        this.vertices.push(vertex);
        continue; // Go to the next line
      case 'vn': // Read normal
        var normal = parseNormal(sp);
        this.normals.push(normal);
        continue; // Go to the next line
      case 'usemtl': // Read Material name
        currentMaterialName = parseUsemtl(sp);
        continue; // Go to the next line
      case 'f': // Read face
        var face = parseFace(
          sp,
          currentMaterialName,
          this.vertices,
          this.textureVt,
          this.normals,
          reverse
        );
        currentObject.addFace(face);
        continue; // Go to the next line
      case 'vt':
        var VTvertex = parseVTertex(sp, 1);
        this.textureVt.push(VTvertex);
        continue;
      default:
        continue;
    }
  }
  objArray[index] = true;
  if (!ifmtl) mtlArray[index] = true;
  return true;
}

//------------------------------------------------------------------------------
// Common function
//------------------------------------------------------------------------------
// 计算法向量，参数为三角面的三个顶点
function calcNormal(p0, p1, p2) {
  // v0: a vector from p1 to p0, v1; a vector from p1 to p2
  var v0 = new Float32Array(3);
  var v1 = new Float32Array(3);

  // 由顶点构造向量
  for (var i = 0; i < 3; i++) {
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }

  // 向量叉积
  var c = new Float32Array(3);
  c[0] = v0[1] * v1[2] - v0[2] * v1[1];
  c[1] = v0[2] * v1[0] - v0[0] * v1[2];
  c[2] = v0[0] * v1[1] - v0[1] * v1[0];

  // 向量归一化
  var v = new Vector3(c);
  v.normalize();
  return v.elements;
}

//在模型文件中根据名字找到对应材质数组颜色
function findColor(target, name) {
  for (var i = 0; i < target.mtls.length; i++) {
    for (var j = 0; j < target.mtls[i].materials.length; j++) {
      if (
        target.mtls[i].materials[j].name.replace(/^\s+|\s+$/g, '') ==
        name.replace(/^\s+|\s+$/g, '')
      ) {
        return target.mtls[i].materials[j].color;
      }
    }
  }
  return new Color(1, 1, 1, 1);
}

//自己实现一个模型加载器
function readOBJFile(
  fileName,
  modelObject,
  mtlArray,
  objArray,
  scale,
  reverse,
  index
) {
  // 创建网络请求对象
  var request = new XMLHttpRequest();

  // 响应报文的回调处理
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status !== 404) {
      // 材质索引
      mtlArray[index] = false;
      // 几何体索引
      objArray[index] = false;
      modelObject[index] = new OBJDoc(fileName);

      var result = OBJDocparser.bind(modelObject[index])(
        request.responseText,
        modelObject,
        mtlArray,
        objArray,
        scale,
        reverse,
        index
      );

      if (!result) {
        g_objDoc = null;
        g_drawingInfo = null;
        console.log('OBJ file parsing error:', fileName);
        return;
      }
    }
  };

  // 请求模型文件
  request.open('GET', fileName, true);
  request.send();
}
