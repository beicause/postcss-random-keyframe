
export type Seed={seed:number}

export function seedRandom(ref: Seed,min?: number, max?: number) {
    max = max || 1
    min = min || 0
    ref.seed = (ref.seed * 9301 + 49297) % 233280
    const rnd = ref.seed / 233280
    return min + rnd * (max - min)
}