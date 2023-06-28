const express = require('express');
const app = express();
const cors = require('cors');
const geoip = require('fast-geoip');
const path = require('path');
const { isValidIP, getAddressFromCountryCode } = require('./utils');
const PORT = '8080';



app.use(express.static(path.join(__dirname, 'public')));

app.use(cors())

app.use('/ip-to-location/:ip', async (req, res) => {
    const ip = req.params.ip;

    if (!ip) {
        return res.status(400).json({
            success: false,
            msg: 'No IP found!'
        });
    }

    if (!isValidIP(ip)) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid IP address!'
        });
    }

    try {
        const { city, country, ...geo} = await geoip.lookup(ip) ?? {};
        console.log({ city, country, geo});

        if(city && country) {
            const fullnameCountry = getAddressFromCountryCode(country);

            return res.status(200).json({
                ip,
                city,
                country: fullnameCountry
            })
        }

        return res.status(404).json({
            success: false,
            msg: 'Address not found!'
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            msg: 'Something went wrong!'
        });
    }
})

app.use('*', (_, res) => {
    res.status(404).json({
        success: false,
        msg: 'API not found!'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
})