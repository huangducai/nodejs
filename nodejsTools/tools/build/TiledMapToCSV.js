/**
 * Created by zxh on 16/1/18.
 */

var fs = require('fs');
var _ = require('underscore');

var mapFile = process.argv[2];
var mapInfo = JSON.parse(fs.readFileSync(mapFile, 'utf8').toString())
//var mapInfo = require(mapFile);//


//var tileproperties = [];
mapInfo.tilesets.forEach(function(item, index) {
    //tileproperties = tileproperties.concat(item.tileproperties);
    var tileproperties = {};
    _.each(item.tileproperties, function(perties, key) {
        tileproperties[key] = true;
    });

    mapInfo.layers[index].tileproperties = tileproperties;
});

var mapArray = [];
for(var i = 0; i < mapInfo.height; i++) {
    var line = [];
    mapArray.push(line);
    for(var j = 0; j < mapInfo.width; j++) {
        mapArray[i][j] = -1;
    }
}

var TMX_TILE_FLIPPED_MASK = 536870911;
////////////////////////////////////////////////////////
function getTileGIDAt(layer, x, y) {

    if(x >= layer.width || y >= layer.height || x < 0 || y < 0)
        throw new Error("invalid position");

    var idx = 0 | (x + y * layer.width);
    var tile = layer.data[idx];

    return (tile & TMX_TILE_FLIPPED_MASK) >>> 0;
}

////////////////////////////////////////////////////////
function setMapFlag(layer,param) {
    for(var i = 0; i < layer.height; i++) {
        for(var j = 0; j < layer.width; j++) {
			if(i == 11 && j == 50){
				console.log();
			}
       
			var id = getTileGIDAt(layer, i, j) - param;
	   
            if (id <= 0) {
				if(param == 129 &&  mapArray[i][j] == -1 ){ //遍历第二层layer时，替换掉-1
					mapArray[i][j] = 0;
				}
                continue;
            }
			
            if (layer.tileproperties[id] && mapArray[i][j] != 0) {
                mapArray[i][j] = 1;
            } else {
                mapArray[i][j] = 0;
            }
        }
    }
};

for(var i = 0; i < mapInfo.layers.length; i++) {
    var layer = mapInfo.layers[i];
	if(i === 1){
		setMapFlag(layer,128+1); //128 为图块height值
	}else{
		setMapFlag(layer,1); //
	}
    
};

var str = "";
for(var i = 0; i < mapArray.length; i++) {
    str += mapArray[i].toString() + '\n';
}
str = str.replace(/[,]/g,'');
fs.writeFileSync('./map.csv', str, 'utf8');

process.exit();
