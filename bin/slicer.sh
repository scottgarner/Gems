#/bin/bash

convert /Users/scott/Desktop/studio010-cubex.png -crop 512x512+0+512\! posy.jpg
convert /Users/scott/Desktop/studio010-cubex.png -crop 512x512+512+0\! negx.jpg
convert /Users/scott/Desktop/studio010-cubex.png -crop 512x512+512+512\! negz.jpg
convert /Users/scott/Desktop/studio010-cubex.png -crop 512x512+1024+512\! posx.jpg
convert /Users/scott/Desktop/studio010-cubex.png -crop 512x512+1536+512\! posz.jpg
convert /Users/scott/Desktop/studio010-cubex.png -crop 512x512+1024+512\! negy.jpg
