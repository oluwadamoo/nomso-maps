
const axios = require('axios');
const ExcelJS = require('exceljs');

const apiKey = 'AIzaSyDd1S9S5nTxRlofcMtPLLu_VVJ_fCzVi-A';

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/search', async (req, res) => {
    const locationText = req.query.location;

    try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationText)}&key=${apiKey}`;
        const geocodeResponse = await axios.get(geocodeUrl);
        const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=restaurant&key=${apiKey}`;
        const placesResponse = await axios.get(placesUrl);

        const restaurantDetails = await Promise.all(
            placesResponse.data.results.map(async (restaurant) => {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.place_id}&fields=name,vicinity,formatted_phone_number&key=${apiKey}`;
                const detailsResponse = await axios.get(detailsUrl);
                const details = detailsResponse.data.result;

                return {
                    name: details.name,
                    address: details.vicinity,
                    phoneNumber: details.formatted_phone_number || 'Not available',
                };
            })
        );

        res.json(restaurantDetails);
    } catch (error) {
        res.status(500).send('Error fetching location data');
    }
});

app.get('/download', async (req, res) => {
    const restaurants = JSON.parse(req.query.data);
    // const title = JSON.parse(req.query.query) + 'xlsx'
    const title = req.query.query.replaceAll(' ', '-')
    console.log(title, "QUERY")
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Restaurants');

    worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Phone Number', key: 'phoneNumber', width: 20 },
        { header: 'Address', key: 'address', width: 30 },
    ];

    restaurants.forEach((restaurant) => {
        worksheet.addRow(restaurant);
    });

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=${title.toLowerCase()}`
    );

    await workbook.xlsx.write(res);
    res.end();
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
