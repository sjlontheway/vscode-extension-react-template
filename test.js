const str = '[2022-04-12 14:38:22.639] [icache_l2] [info] [8] l2 cache op[11] done at pa 0x14de6471c, length 4'
const reg = /^\[(?<date>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\]\s\[(?<unit>[a-zA-Z_\d]+)\]\s\[info\]\s\[(?<cycle>\d+)\](?<des>.*)$/

const a = [
    'ftmalloc: warning: ft_usable_size: pointer might not point to a valid heap region: 0x7ffef800e6c0',
    '(this may still be a valid very large allocation (over 64MiB))',
    'ftmalloc: warning: (yes, the previous pointer 0x7ffef800e6c0 was valid after all)',
    'ftmalloc: warning: ft_usable_size: pointer might not point to a valid heap region: 0x7ffef800e6c0',
    '(this may still be a valid very large allocation (over 64MiB))',
    'ftmalloc: warning: (yes, the previous pointer 0x7ffef800e6c0 was valid after all)',
    '[2022-04-12 14:38:22.379] [main] [info] [09:37:14] start at pc: 0x40d71c',
    '[2022-04-12 14:38:22.379] [main] [info] concurrency [64]',
    '[2022-04-12 14:38:22.379] [main] [info] qemu cpoint ddr: /home/xuxiali/code/traces/401_1339/kernel_ddr.bin',
    '[2022-04-12 14:38:22.379] [main] [info] qemu cpoint cpu: /home/xuxiali/code/traces/401_1339/cpu.ini',
    '[2022-04-12 14:38:22.379] [main] [info] qemu cpoint itraces: /home/xuxiali/code/traces/401_1339/0000001339.bin.gz',
    '[2022-04-12 14:38:22.382] [timeline] [info] cache queue block is 357MB， sizeof(op_concurrent_queue）= 8320',
    'ftmalloc: warning: ft_usable_size: pointer might not point to a valid heap region: 0x20020007a00',
    '(this may still be a valid very large allocation (over 64MiB))',
    'ftmalloc: warning: (yes, the previous pointer 0x20020007a00 was valid after all)',
    'ftmalloc: warning: ft_usable_size: pointer might not point to a valid heap region: 0x20020007a00',
    '(this may still be a valid very large allocation (over 64MiB))',
    'ftmalloc: warning: (yes, the previous pointer 0x20020007a00 was valid after all)',
    'ftmalloc: warning: ft_usable_size: pointer might not point to a valid heap region: 0x20036c08780',
    '(this may still be a valid very large allocation (over 64MiB))',
    'ftmalloc: warning: (yes, the previous pointer 0x20036c08780 was valid after all)',
    'ftmalloc: warning: ft_usable_size: pointer might not point to a valid heap region: 0x20036c08780',
    '(this may still be a valid very large allocation (over 64MiB))',
    'ftmalloc: warning: (yes, the previous pointer 0x20036c08780 was valid after all)',
    '[2022-04-12 14:38:22.634] [main] [info] 1649745502634ms start',
    '[2022-04-12 14:38:22.634] [predict_unit] [info] [0]------ block predict pc 0x40d71c, out pc start 0x40d71c end 0x40d720 ------',
    '[2022-04-12 14:38:22.634] [predict_unit] [info] [0] send a op[1] to ITLB, predicted pc = 0x40d71c',
    '[2022-04-12 14:38:22.634] [predict_unit] [info] [0] send a op[2] to push fetch queue, predicted pc = 0x40d71c',
    '[2022-04-12 14:38:22.634] [table_walker] [info] descaddr 6227873792, data 6227898371',
    '[2022-04-12 14:38:22.634] [table_walker] [info] descaddr 6227898368, data 6227902467',
    '[2022-04-12 14:38:22.634] [table_walker] [info] descaddr 6227902480, data 6227906563',
    '[2022-04-12 14:38:22.634] [table_walker] [info] descaddr 6227906664, data 9007204856647635',
    '[2022-04-12 14:38:22.634] [mmu_unit] [info] [4] translate op[1] done at va 0x40d71c, pa 0x14de6471c',
    '[2022-04-12 14:38:22.634] [fetch_unit] [info] [4] get a notice that fetch queue is not empty',
    '[2022-04-12 14:38:22.635] [predict_unit] [info] [4] push fetch queue succ, op[2]',
    '[2022-04-12 14:38:22.635] [predict_unit] [info] [4] send a op[5] to next cycle to predicted pc 0x40d720',
    '[2022-04-12 14:38:22.635] [predict_unit] [info] [4] translate return and send a op[6] to L1 cache, pa 0x14de6471c, size 4',
    '[2022-04-12 14:38:22.636] [icache_l1] [info] [4] l1 cache op[6] response at pa 0x14de6471c, length 4',
    '[2022-04-12 14:38:22.636] [predict_unit] [info] [5]------ block predict pc 0x40d720, out pc start 0x40d720 end 0x40d740 ------',
    '[2022-04-12 14:38:22.637] [fetch_unit] [info] [5] set PENDING because that IC Tags not ready, op [2], va 0x40d71c, size 4',
    '[2022-04-12 14:38:22.638] [predict_unit] [info] [5] send a op[8] to ITLB, predicted pc = 0x40d720',
    '[2022-04-12 14:38:22.638] [predict_unit] [info] [5] send a op[9] to push fetch queue, predicted pc = 0x40d720',
    '[2022-04-12 14:38:22.638] [icache_l1] [info] [8] l1 cache op[6] done at pa 0x14de6471c, length 4',
    '[2022-04-12 14:38:22.639] [predict_unit] [info] [8] L1 cache return and send a op[6] to L2 cache, pa 0x14de6471c, size 4',
    '[2022-04-12 14:38:22.639] [icache_l2] [info] [8] l2 cache op[11] done at pa 0x14de6471c, length 4',
    '[2022-04-12 14:38:22.640] [predict_unit] [info] [9] push fetch queue succ, op[9]',
    '[2022-04-12 14:38:22.640] [predict_unit] [info] [9] send a op[13] to next cycle to predicted pc 0x40d740',
    '[2022-04-12 14:38:22.640] [mmu_unit] [info] [9] translate op[8] done at va 0x40d720, pa 0x14de64720',
    '[2022-04-12 14:38:22.640] [predict_unit] [info] [9] translate return and send a op[14] to L1 cache, pa 0x14de64720, size 32',
    '[2022-04-12 14:38:22.641] [icache_l1] [info] [9] l1 cache op[14] response at pa 0x14de64720, length 32',
    '[2022-04-12 14:38:22.641] [predict_unit] [info] [10]------ block predict pc 0x40d740, out pc start 0x40d740 end 0x40d760 ------[2022-04-12 14:38:22.641] [predict_unit] [info] [10] send a op[16] to ITLB, predicted pc = 0x40d740',
    '[2022-04-12 14:38:22.641] [predict_unit] [info] [10] send a op[17] to push fetch queue, predicted pc = 0x40d740',
    '[2022-04-12 14:38:22.641] [icache_l2] [info] [12] l2 cache op[11] response at pa 0x14de6471c, length 4',
    '[2022-04-12 14:38:22.642] [fetch_unit] [info] [12] switch RUNNING because that IC Tags ready, op [2], va 0x40d71c, size 4',
    '[2022-04-12 14:38:22.643] [icache_l1] [info] [13] l1 cache op[14] done at pa 0x14de64720, length 32',
    '[2022-04-12 14:38:22.643] [fetch_unit] [info] [13] CacheLine Invalid (ICTAG: cache miss): send a op[21] to dram, pa 0x14de6471c, size 4, switch PENDING to wait dram return',
    '[2022-04-12 14:38:22.645] [predict_unit] [info] [13] L1 cache return and send a op[14] to L2 cache, pa 0x14de64720, size 32',
    '[2022-04-12 14:38:22.645] [dram_unit] [info] [13] op[21] get instuction at phyaddr = 0x14de64700',
    '[2022-04-12 14:38:22.645] [icache_l2] [info] [13] l2 cache op[22] done at pa 0x14de64720, length 32',
    '[2022-04-12 14:38:22.645] [predict_unit] [info] [14] push fetch queue succ, op[17]',
    '[2022-04-12 14:38:22.645] [predict_unit] [info] [14] send a op[25] to next cycle to predicted pc 0x40d760',
    '[2022-04-12 14:38:22.645] [mmu_unit] [info] [14] translate op[16] done at va 0x40d740, pa 0x14de64740',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [14] translate return and send a op[26] to L1 cache, pa 0x14de64740, size 32',
    '[2022-04-12 14:38:22.646] [icache_l1] [info] [14] l1 cache op[26] response at pa 0x14de64740, length 32',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [15]------ block predict pc 0x40d760, out pc start 0x40d760 end 0x40d780 ------[2022-04-12 14:38:22.646] [predict_unit] [info] [15] send a op[28] to ITLB, predicted pc = 0x40d760',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [15] send a op[29] to push fetch queue, predicted pc = 0x40d760',
    '[2022-04-12 14:38:22.646] [icache_l2] [info] [17] l2 cache op[22] response at pa 0x14de64720, length 32',
    '[2022-04-12 14:38:22.646] [icache_l1] [info] [18] l1 cache op[26] done at pa 0x14de64740, length 32',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [18] L1 cache return and send a op[26] to L2 cache, pa 0x14de64740, size 32',
    '[2022-04-12 14:38:22.646] [icache_l2] [info] [18] l2 cache op[31] done at pa 0x14de64740, length 32',
    '[2022-04-12 14:38:22.646] [mmu_unit] [info] [19] translate op[28] done at va 0x40d760, pa 0x14de64760',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [19] push fetch queue succ, op[29]',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [19] send a op[33] to next cycle to predicted pc 0x40d780',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [19] translate return and send a op[34] to L1 cache, pa 0x14de64760, size 32',
    '[2022-04-12 14:38:22.646] [icache_l1] [info] [19] l1 cache op[34] response at pa 0x14de64760, length 32',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [20]------ block predict pc 0x40d780, out pc start 0x40d780 end 0x40d7a0 ------[2022-04-12 14:38:22.646] [predict_unit] [info] [20] send a op[36] to ITLB, predicted pc = 0x40d780',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [20] send a op[37] to push fetch queue, predicted pc = 0x40d780',
    '[2022-04-12 14:38:22.646] [icache_l2] [info] [22] l2 cache op[31] response at pa 0x14de64740, length 32',
    '[2022-04-12 14:38:22.646] [icache_l1] [info] [23] l1 cache op[34] done at pa 0x14de64760, length 32',
    '[2022-04-12 14:38:22.646] [predict_unit] [info] [23] L1 cache return and send a op[34] to L2 cache, pa 0x14de64760, size 32',
]

console.time('parse')
const parse = []
for (let line of a) {
    const m = line.match(reg)
    if (m && m.groups) {
        const { unit, cycle, des } = m.groups

        parse.push({
            unit, cycle, des
        })
    }
}
console.log(parse)
console.timeEnd('parse')