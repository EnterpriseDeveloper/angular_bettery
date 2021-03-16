import Biconomy from "@biconomy/mexa";

const biconomyInit = async () => {
    let biconomy = new Biconomy("https://rpc-mumbai.matic.today",
        {
            apiKey: "iwIgyW3sM.12ac582c-bd06-4289-8d48-47ef552af03f",
            strictMode: true
        });
    await BiconomyReady(biconomy);
    window.biconomy = biconomy;
}

async function BiconomyReady(biconomy) {
    return new Promise<void>((resolve, reject) => {
        return biconomy
            .onEvent(biconomy.READY, async () => {
                resolve()
            })
            .onEvent(biconomy.ERROR, (error, message) => {
                reject(error);
            });
    });
}

export default biconomyInit;


