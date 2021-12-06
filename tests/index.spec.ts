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
      a { transform: translate(0.2113212px,7.0361060px) }
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
        to { transform: translate(0.2113212px,7.0361060px) }
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
          0% { transform: translate(0.2113212px,7.0361060px) }
          20.000002% { transform: translate(0.5467721px,7.3357922px) }
          40.000004% { transform: translate(0.8194659px,0.4472068px) }
          60.000006% { transform: translate(0.3750814px,8.4073868px) }
          80.000008% { transform: translate(0.9667052px,5.2755916px) }
          20% { transform: translate(0.1992755px,0.6731996px) }
          40.000002% { transform: translate(0.6406936px,0.3023748px) }
          60.000004% { transform: translate(0.5996013px,0.1033608px) }
          80.000006% { transform: translate(0.5698260px,0.1625772px) }
          100% { transform: translate(0.3414909px,0.4182956px) } 
        }
        @keyframes b{
          iteration-count:5;
          0% { transform: translate(0.7787937px,7.6718570px) }
          20.000002% { transform: translate(0.2644504px,8.6221605px) }
          40.000004% { transform: translate(0.8108068px,5.1545628px) }
          60.000006% { transform: translate(0.8376157px,8.7283230px) }
          80.000008% { transform: translate(0.6164823px,0.9582562px) }
          12% { transform: translate(0.3819745px,0.9556927px) }
          32.0000012% { transform: translate(0.1094007px,0.7474194px) }
          52.0000024% { transform: translate(0.9592550px,0.2418210px) }
          72.0000036% { transform: translate(0.3883273px,0.0438357px) }
          92.0000048% { transform: translate(0.9274820px,0.7213649px) } 
        }
      "
  `)
})
