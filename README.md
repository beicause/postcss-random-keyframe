# postcss-random-keyframe

[PostCSS] plugin for making random animation.
 It provides a random function and generates keyframes repeatedly:

[PostCSS]: https://github.com/postcss/postcss

```css
/* Input example */
@keyframes a {
  iteration-count:5; /* add this property to iterate */
  from { transform: translate(random()px,random(-0.2,10)px) }
  to { transform: translate(random()px,random()px) } 
}
```

```css
/* Output example */
@keyframes a {
  iteration-count:5;
  0% { transform: translate(0.21132px,7.03611px) }
  20.000002% { transform: translate(0.54677px,7.33579px) }
  40.000004% { transform: translate(0.81947px,0.44721px) }
  60.000006% { transform: translate(0.37508px,8.40739px) }
  80.000008% { transform: translate(0.96671px,5.27559px) }  
  20% { transform: translate(0.19928px,0.67320px) }
  40.000002% { transform: translate(0.64069px,0.30237px) }
  60.000004% { transform: translate(0.59960px,0.10336px) }
  80.000006% { transform: translate(0.56983px,0.16258px) }
  100% { transform: translate(0.34149px,0.41830px) } 
}
```

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-random-keyframe
```

**Step 2:** Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-random-keyframe'),
    require('autoprefixer')
  ]
}
```
## CSS
- **Value: random(min, max)**  
returns a random value between two numbers, random() means [0,1], random(num) means [0,num].  

- **Property: iteration-count**  
used to iterate keyframe with offset, only effective in @keyframes rule.

## Options

```ts
type Options = {
  scope?: 'keyframe'|'global',// scope for random function. It can be used globally. default: keyframe
  floatingPoint?: number,   // the number of digits after decimal point, default: 7
  randomSeed?: number,      // initial seed to generate random number, default: 0
  offset?: number           // offset for iteration, default: 0.0000001
}
```

[official docs]: https://github.com/postcss/postcss#usage
