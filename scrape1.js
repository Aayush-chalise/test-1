import axios from "axios";
import cheerio from "cheerio";

async function fetchData(){
  const response = await axios.get('URL');
  console.log(response.data);
}