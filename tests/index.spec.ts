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

const cssRule = `transform: translate(random()px,random(-0.2,10)px);margin:random(10)px`
it("random in global", async () => {
  const css = `
  a { ${cssRule} }
  `
  const resDisabled = await runWithoutWarnings(css)
  const res = await runWithoutWarnings(css, { scope: "global" })
  expect(resDisabled.css).toEqual(css)
  expect(res.css).toMatchInlineSnapshot(`
    "
      a { transform: translate(0.2113212px,7.0361060px);margin:5.4677212px }
      "
  `)
})

it("random in keyframes", async () => {
  const res = await runWithoutWarnings(`
  @keyframes a{
    to { ${cssRule} }
  }`)
  expect(res.css).toMatchInlineSnapshot(`
    "
      @keyframes a{
        to { transform: translate(0.2113212px,7.0361060px);margin:5.4677212px }
      }"
  `)
})

it("random with invalid number", async () => {
  await expect(
    run(`
  @keyframes a{
    to { transform: translate(random(1a)px,random(-0.2,10)px) }
  }`)
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"postcss-random-keyframe: <css input>:3:38: Invalid number \\"1a\\""`
  )
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
      from { ${cssRule} }
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
          0% { transform: translate(0.2113212px,7.0361060px);margin:5.4677212px }
          20.000002% { transform: translate(0.7388032px,8.1585520px);margin:0.6345165px }
          40.000004% { transform: translate(0.3750814px,8.4073868px);margin:9.6670525px }
          60.000006% { transform: translate(0.5368227px,1.8326106px);margin:6.7319959px }
          80.000008% { transform: translate(0.6406936px,2.8842233px);margin:5.9960134px }
          20% { transform: translate(0.1033608px,0.5698260px) }
          40.000002% { transform: translate(0.1625772px,0.3414909px) }
          60.000004% { transform: translate(0.4182956px,0.7787937px) }
          80.000006% { transform: translate(0.7717507px,0.2644504px) }
          100% { transform: translate(0.8649177px,0.8108068px) } 
        }
        @keyframes b{
          iteration-count:5;
          0% { transform: translate(0.5249571px,8.3436806px) }
          20.000002% { transform: translate(0.8753258px,6.0881199px) }
          40.000004% { transform: translate(0.1135545px,3.6961394px) }
          60.000006% { transform: translate(0.9556927px,0.9158873px) }
          80.000008% { transform: translate(0.7474194px,9.5844007px) }
          12% { transform: translate(0.2418210px,0.3883273px) }
          32.0000012% { transform: translate(0.0438357px,0.9274820px) }
          52.0000024% { transform: translate(0.7213649px,0.6261017px) }
          72.0000036% { transform: translate(0.5830504px,0.1631987px) }
          92.0000048% { transform: translate(0.1227195px,0.6251929px) } 
        }
      "
  `)
})
