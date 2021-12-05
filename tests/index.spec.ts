import postcss, { Result, LazyResult, Root } from "postcss"
import plugin, { Options } from "../src"

async function run(
  input: string | { toString(): string } | Result | LazyResult | Root,
  opts?: Options
) {
  return await postcss([plugin(opts)]).process(input, { from: undefined })
}
async function runWithoutWarnings(
  input: string | { toString(): string } | Result | LazyResult | Root,
  opts?: Options
) {
  const res = await run(input, opts)
  expect(res.warnings()).toHaveLength(0)
  return res
}

it("random in global", async () => {
  const css = `
  a { transform: translate(random()px,random(-0.2,10)px) }
  `
  const resDisabled = await runWithoutWarnings(css)
  const res = await runWithoutWarnings(css, { useRandomGlobal: true })
  expect(resDisabled.css).toEqual(css)
  expect(res.css).toMatchInlineSnapshot(`
    "
      a { transform: translate(0.21132px,7.03611px) }
      "
  `)
})

it("random in keyframes", async () => {
  const res = await runWithoutWarnings(`
  @keyframes a{
    to { transform: translate(random()px,random(-0.2,10)px) }
  }`)
  expect(res.css).toMatchInlineSnapshot(`
    "
      @keyframes a{
        to { transform: translate(0.21132px,7.03611px) }
      }"
  `)
})

it("random with invalid number", async () => {
  await expect(
    run(`
  @keyframes a{
    to { transform: translate(random()px,random(-0.2e,10)px) }
  }`)
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"postcss-random-keyframe: <css input>:3:49: Invalid number \\"-0.2e\\""`
  )
  await expect(
    run(`
  @keyframes a{
    to { transform: translate(random()px,random(-0.2,e10)px) }
  }`)
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"postcss-random-keyframe: <css input>:3:54: Invalid number \\"e10\\""`
  )
})

// TODO
// it('random nesting',async ()=>{
// const res=await runWithoutWarnings(`@keyframes {
// 0% { transform: translate(random(-random(10,20),random(20,30))px,10px) }
// 100% { transform: translate(0,0) }
// }`)
// })

it("iteration keyframes", async () => {
  const res = await runWithoutWarnings(`
    @keyframes a{
      iteration-count:5;
      from { transform: translate(random()px,random(-0.2,10)px) }
      to { transform: translate(random()px,random()px) } 
    }
    @keyframes b{
      iteration-count:5;
      0% { transform: translate(random()px,random(-0.2,10)px) }
      60% { transform: translate(random()px,random()px) } 
    }
  `)
  expect(res.css).toMatchInlineSnapshot(`
"
    @keyframes a{
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
    @keyframes b{
      iteration-count:5;
      0% { transform: translate(0.77879px,7.67186px) }
      20.000002% { transform: translate(0.26445px,8.62216px) }
      40.000004% { transform: translate(0.81081px,5.15456px) }
      60.000006% { transform: translate(0.83762px,8.72832px) }
      80.000008% { transform: translate(0.61648px,0.95826px) }
      12% { transform: translate(0.38197px,0.95569px) }
      32.0000012% { transform: translate(0.10940px,0.74742px) }
      52.0000024% { transform: translate(0.95925px,0.24182px) }
      72.0000036% { transform: translate(0.38833px,0.04384px) }
      92.0000048% { transform: translate(0.92748px,0.72136px) } 
    }
  "
`)
})
