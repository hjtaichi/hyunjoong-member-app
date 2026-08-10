const fs=require("node:fs");
const path=require("node:path");
describe("mypage registration review badge",()=>{
  const s=fs.readFileSync(path.join(process.cwd(),"src","features","mypage","components","MyPageHeroCard.jsx"),"utf8");
  test("uses registration wording for uncovered status",()=>{
    expect(s).toContain('"재등록 확인 필요"');
    expect(s).toContain("!payment?.isCovered");
  });
  test("uses a soft warning style",()=>{
    expect(s).toContain('backgroundColor: "#FFF3F0"');
    expect(s).toContain('borderWidth: 1');
    expect(s).toContain('borderColor: "#E7B8AA"');
    expect(s).toContain('color: "#8F4B3E"');
  });
});