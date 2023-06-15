
// https://github.com/munach/obsidian-extract-pdf-annotations/blob/master/extractHighlight.ts

// return text between min and max, x and y
function searchQuad(minx : number, maxx : number, miny : number, maxy : number, items : any) {
    const mycontent = items.reduce(function (txt : string, x : any) {
      if (x.width == 0) return txt                      // eliminate empty stuff
      if (!((miny <= x.transform[5]) && (x.transform[5] <= maxy))) return txt  // y coordinate not in box
      if (x.transform[4] + x.width < minx) return txt   // end of txt before highlight starts
      if (x.transform[4] > maxx) return txt             // start of text after highlight ends 
  
      const start = (x.transform[4] >= minx ? 0 :       // start at pos 0, when text starts after hightlight start
        Math.floor(x.str.length * (minx - x.transform[4]) / x.width))  // otherwise, rule of three: start proportional
      if (x.transform[4] + x.width <= maxx) {           // end of txt ends before highlight ends
        return txt + x.str.substr(start)                //     
      } else {                                          // else, calculate proporation end to get the expected length
        const lenc = Math.floor(x.str.length * (maxx - x.transform[4]) / x.width) - start
        return txt + x.str.substr(start, lenc)
      }}, '')
    return mycontent.trim()
  }
  

  // iterate over all QuadPoints and join retrieved lines 
  export function extractHighlight(annot : any, items: any) {
    const highlight = annot.quadPoints.reduce((txt : string, quad : any) => {
      const minx = quad.reduce((prev : number, curr : any) => Math.min(prev, curr.x), quad[0].x)
      const maxx = quad.reduce((prev : number, curr : any) => Math.max(prev, curr.x), quad[0].x)
      const miny = quad.reduce((prev : number, curr : any) => Math.min(prev, curr.y), quad[0].y)
      const maxy = quad.reduce((prev : number, curr : any) => Math.max(prev, curr.y), quad[0].y)
      const res = searchQuad(minx, maxx, miny, maxy, items)
    if (txt.substring(txt.length - 1) != '-') {
			return txt + ' ' + res    // concatenate lines by 'blank' 
    } else if (txt.substring(txt.length - 2).toLowerCase() == txt.substring(txt.length - 2) &&  // end by lowercase-
                res.substring(0,1).toLowerCase() == res.substring(0,1)) {						 // and start with lowercase
			return txt.substring(0,txt.length - 1) + res	// remove hyphon
    } else {
        return txt + res							// keep hyphon 
    }
    }, '');
    return highlight
  }

