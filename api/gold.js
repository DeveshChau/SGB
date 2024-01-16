const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://ibjarates.com/';

async function getGoldPrice() {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const labelElement = $('#lblrate24K'); 
        const labelText = labelElement.text().trim();
        return +labelText;
      } catch (error) {
        console.log('Error fetching data:', error);
        return null;
      }
}

module.exports = {getGoldPrice}