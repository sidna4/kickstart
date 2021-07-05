import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    CampaignFactory.abi,
    '0x1A5A8Fa8eBfd6d1Df51753203eBefDDf0855cD43'
);

export default instance;
