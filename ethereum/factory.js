import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    CampaignFactory.abi,
    '0xb49b417D4214775977E6fcbc1f8706F10dBF9dbB'
);

export default instance;
