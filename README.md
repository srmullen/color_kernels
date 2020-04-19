Notorious RGB: Image Processing in Javascript: Color Models
-------------

This is the second installment in a series of articles covering image processing in Javascript. In the previous installment I covered how to read the pixels of an image, process them on the GPU, and display them in the canvas. Check it out.

[Look at this Photograph](https://medium.com/@srmullen13/look-at-this-photograph-9713d43f79ac)

[Start editing photos right away with the demo site I built.](https://srmullen.github.io/color_kernels/)

As a quick recap, we’re using GPU.js in order to parallelize our image processing algorithms. And here’s the code for displaying an image.

https://gist.github.com/srmullen/82cb776fa6e159f78271b5608f725311

The pixel data is stored as values of red, green, and blue intensities. This is common for digital image formats (such as PNG and GIF¹) and it makes sense. The physical pixels of a computer screen are made up of tiny red, green, and blue lights, which, when combined together allows us to perceive any color in the visible spectrum.

This is not the only way color can be represented. It works well when creating color with light sources, such as the LEDs in your computer monitor, but it doesn’t work well for other mediums. Consider painting your new picket fence. You wouldn’t mix red, green, and blue paint together and expect it to be white. The HOA will be knocking at your door. For this reason the RGB color model is considered an additive model. The more of each constituent color added makes the composite brighter.
When working with inks, paints, etc., we’re working with a subtractive model. Rather than using lights to create color for us, we’d have an external light source projected onto our medium. Any pigments added to that medium absorb light and reflect the color you see. The standard model for adding colors in a subtractive fashion is CMYK, which stands for Cyan — Magenta — Yellow — Key. Key is the black component and is called as such because it adds the detail to the image, or so Wikipedia tells me. You may be familiar with them because they are most likely the inks in your color printer cartridge.

Let’s see what the CMYK channels look like individually.

![CMYK Channels: bottom-left = cyan, top-left = magenta, top-right = yellow, bottom-right = key](/images/cmyk_giraffe.png)

Now let’s see how the CMYK channels overlap to create a natural colored image.

![Center contains all CMYK channels.](/images/cmyk_overlap_giraffe.png)

## Convert TGB to CMYK (and back again)

Like RGB, we’ll work with CMYK values in the range 0 to 1. The formula for converting RGB to CMYK is as follows².
```
key = max(red, green, blue)
cyan = (1 - red - key) / (1 - key)
magenta = (1 - green - key) / (1 - key)
yellow = (1 - blue - key) / (1 - key)
```
And CMYK back to RGB

```
red = (1 - cyan) * (1 - key)
green = (1 - magenta) * (1 - key)
blue = (1 - yellow) * (1 - key)
```

### Defining functions on the GPU.

In the previous tutorial we created kernel functions. These move our data onto the GPU for processing in parallel. We can also write functions that will work like regular Javascript functions but can be used in our kernels on the GPU. GPU.js provides a method to accomplish this: gpu.addFunction. It takes a named function as an argument. We use it here to help simply the code and make it more clear what the kernel is doing.

https://gist.github.com/srmullen/ca2f2b68b09c02f406cdfaae62c77fde#file-cmykkernel-js

In this example we add rgb2cmyk and cmyk2rgb functions. On line 28 the RGB values are converted to CMYK. We can then do as we please with the CMYK values. On lines 30 through 33 they are multiplied by an argument to the kernel. Line 36 sees our altered CMYK values turned back to RGB so they can be written to the canvas.

[Try this kernel out here.](https://srmullen.github.io/color_kernels/?mode=cmyk)

## HSV — A Can of Color

HSV, or Hue-Saturation-Value, is different from RGB and CMYK. Unlike them, it is not based on color mixing. Instead, it was designed to be more closely aligned with human perception of color. The HSV color model is often displayed as a cylinder.

Along the circumference of the cylinder are the fully saturated colors. Moving toward the center of the cylinder reduces the saturation, or intensity, of the color. Value is a measure of the color’s shade. A value of 0 is always black, and a value of 1 has no shading.
Hue is a representation of color as an angle of rotation. At 0° is red. As we start rotating around the cylinder we reach green at 120°. The colors between 0° and 120° are a linear interpolation between red and green. The next 120° around the cylinder go from green to blue, and then blue back to red at 360°. I find it interesting that this linear interpolation produces Cyan, Magenta, and Yellow at midway point between the pure Red, Green, and Blue angles.
To give an idea of how changing the hue works, the following image shows how an image would look with rotations in increments of 90° applied to every pixel.

![Hue Rotation: bottom-left = 0°, top-left = 90°, top-right = 180°, bottom-right = 270°](/images/hsv_rotation_giraffe.png)

https://gist.github.com/srmullen/b8a1e269484af5ff31b3991da938a102#file-hsvkernel-js

[Play with that kernel here!](https://srmullen.github.io/color_kernels/?mode=hsv)

There are plenty of other color models out there to explore. HSL, or HSB, (Hue — Saturation — Lightness/Brightness) is another common model similar in concept to HSV.

Footnotes
[1] I’m going to wade into the GIF pronunciation debate just because I feel like it. Giraffe.
[2] The formulas I’m using come from rapidtables.

-------------------------------------------------------------------------------------

