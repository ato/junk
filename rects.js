var ctx1 = document.getElementById("canvas").getContext('2d');
var ctx2 = document.getElementById("canvas2").getContext('2d');
var zoneSelect = document.getElementById("zones");
var mergeCheckbox = document.getElementById("merge");

//--------------------- Drawing ------------------------------

function drawRect(ctx, r, hue, label) {
    ctx.fillStyle = 'hsl(' + hue + ', 70%, 50%)';
    ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillText(label, r.x1 + 5, r.y1 + 15);
}

function drawRects(ctx, set) {
    var huestep = 360 / set.length;
    ctx.clearRect(0, 0, 500, 500);
    for (var i = 0; i < set.length; i++) {	
        drawRect(ctx, set[i], i * huestep, i);
    }
}

//--------------------- Masking ------------------------------

// return the intersection of two rectangles
function intersection(a, b) {
    if (a.x2 < b.x1 || b.x2 < a.x1 || a.y2 < b.y1 || b.y2 < a.y1) {
        return null; // no intersection
    } else {
        return {
            x1: Math.max(a.x1, b.x1),
            x2: Math.min(a.x2, b.x2),
            y1: Math.max(a.y1, b.y1),
            y2: Math.min(a.y2, b.y2),
        };
    }
}

// return true unless r is an empty rectangle
function notEmptyRect(r) {
    return r.x2 - r.x1 > 0 && r.y2 - r.y1 > 0;
}

// subtract rectangle b from rectangle a
function subtraction(a, b) {
    c = intersection(a, b);
    if (c) {
        return [
                {x1: a.x1, x2: a.x2, y1: a.y1, y2: c.y1}, // top mask
                {x1: a.x1, x2: c.x1, y1: c.y1, y2: c.y2}, // left mask
                {x1: c.x2, x2: a.x2, y1: c.y1, y2: c.y2}, // right mask
                {x1: a.x1, x2: a.x2, y1: c.y2, y2: a.y2}, // bottom mask
        ].filter(notEmptyRect);        
    } else {
        return [a];
    }
}

// subtract a rectangle from a set of masks
function maskSubtraction(masks, r) {
    return masks.reduce(function(ms, m) {
        return ms.concat(subtraction(m, r))
    }, []);
}

// find a set of rectangles that mask the given zones
function mask(zones) {
    var wholePage = {x1:0, y1:0, x2:500, y2:500};
    return zones.reduce(maskSubtraction, [wholePage]);
}

//--------------- Merging (optional) ---------------------

// merge rectangles that cover the same horizontal interval
function mergeH(rs) {
    rs.sort(function(a, b) { return (a.x1 - b.x1) || (a.y1 - b.y1); });
    var out = [];
    for (var i = 0; i < rs.length;) {
        var a = rs[i];
        while (++i < rs.length && 
               a.y2 == rs[i].y1 &&
	       a.x1 == rs[i].x1 && 
               a.x2 == rs[i].x2) {
            a.y2 = rs[i].y2;
        }
        out.push(a);
    }
    return out;
}

//--------------------- Main ------------------------------

function main() {
    // bunch of test zones    
    var zones = [{x1:200, x2:400, y1:200, y2:400}, 
		 {x1:100, x2:250, y1:100, y2:250},
		 {x1:300, x2:450, y1:50,  y2:250}, 
		 {x1:130, x2:320, y1:30,  y2:150},
		 {x1:30,  x2:120, y1:330, y2:420},
		 {x1:0,   x2:500, y1:440, y2:460},
		 {x1:400, x2:450, y1:330, y2:480}, 
		].slice(0, zoneSelect.value);
    
    masks = mask(zones);
    
    // merge redundant masks
    if (mergeCheckbox.checked) {
	masks = mergeH(masks);
    }

    drawRects(ctx1, zones);
    drawRects(ctx2, masks);
}

main();
