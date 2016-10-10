import fs from 'fs';
import btoa from 'btoa';
import nodeSass from 'node-sass';


import nodeSassUtils from 'node-sass-utils';
const sassUtils = nodeSassUtils( nodeSass );

module.exports = function( gulp, context ) {

  let hexToRgbA = (hex) => {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
  }

  const configSassCompiler = context.getConfigCompiler('sass');

  // TODO: export function in another file
  let svg64 = ( symbol, color ) => {

    let colorRgba = null;

    if(sassUtils.typeOf(color) == 'string') {
      colorRgba = hexToRgbA( sassUtils.castToJs( color ) );
    } else if(sassUtils.typeOf(color) == 'color') {
      colorRgba = `rgba(${color.getR()},${color.getG()},${color.getB()},${color.getA()})`;
    }

    let symbolFile = fs.readFileSync(
      `${context.getBasePath( 'images' )}/icons/${symbol.getValue()}.svg`,
      'utf8');

    // /fill(\s{1,})*=(\s{1,})*"#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})"/g match --> fill="HEXCOLOR"
    // #([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}) match --> HEZCOLOR

    let symbolColor = symbolFile.replace(
      /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g,
      `${colorRgba}`
    );

    let base64String = btoa( symbolColor );

    return new nodeSass.types.String( base64String )
  };

  // Add function svg64 to sass functions
  configSassCompiler.functions[ 'svg64($symbol, $color)' ] = svg64;

  // Test task
  //gulp.task( 'test', () => {
  //  console.log('Imported task is working...');
  //} );

};