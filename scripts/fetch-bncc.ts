import { getBnccSkillByCode } from '../src/lib/bncc/services/bncc-service'

const code = process.argv[2] || 'EF05HI04'

getBnccSkillByCode(code).then((d) => {
  console.log(JSON.stringify(d, null, 2))
  process.exit(0)
}).catch((e) => { console.error(e); process.exit(1) })
