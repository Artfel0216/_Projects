interface PokemonType {
    type: {
        name: string;
    };
}

export const typeHandler = (types: PokemonType[]): string => {
    if (types[1]) {
        return types[0].type.name + " | " + types[1].type.name;
    }
    return types[0].type.name;
};