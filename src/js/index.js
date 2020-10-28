import * as fcns from './functions.js';

try {


const form = document.querySelector('form');

////// IF THE CURRENT PAGE IS INDEX
if(form) {

    // Accessing formEls 
    const formEls = form.elements;

    // Selecting address initially, getting adressRadio, which is then being used for getting input values
    const addressRadio = document.getElementById('locationselect-adr');
    addressRadio.checked = true;

    // Selecting circle initially , getting circleRadio, which is then being used for getting input values
    const circleRadio = document.getElementById('rangeselect-circle');
    circleRadio.checked = true;

    // Setting up the refresh map button
    const refreshBtn = document.getElementById('refresh');
    refreshBtn.addEventListener('click', async () => {

        const formEls = form.elements;
        let coords;
        
        try {

            //Getting coords
            coords = await fcns.getCoords(addressRadio, formEls);

        } catch (err) {

           fcns.showError('Nepodařilo se získat souřadnice. Zkuste to znovu později.');

            return;

        }
        try {

            // Rendering map to the screen
            fcns.createMap(...coords);

        } catch {

            fcns.showError('Nepodařilo se získat mapu. Zkuste to znovu později.');

        }
    })

    //Showing the proper input(s) whenever the user chooses if he wants to get the base location by adress or by coords
    const locationSelect  = document.getElementById('locationselect-adr').parentElement.parentElement;
    const addressInputSet = document.getElementById('address').closest('.form__set');
    const coordInputSet = document.getElementById('coord-lat').closest('.form__set');

    locationSelect.addEventListener('input', (e) => {
        fcns.changeInputType(addressInputSet, coordInputSet, 'adr', e);
    })

    //Showing the proper input(s) whenever the user chooses if he wants to find a trip place in a circle or in an annulus
    const rangeSelect = document.getElementById('rangeselect-circle').parentElement.parentElement;
    const annulusInputSet = document.getElementById('annulus-perimeter-outer').closest('.form__set');
    const circleInputSet = document.getElementById('circle-perimeter').closest('.form__set');

    rangeSelect.addEventListener('input', (e) => {
        fcns.changeInputType(annulusInputSet, circleInputSet, 'annulus', e);
    })

    //Form submit handling
    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        // Finding out, if all needet inputs are valid
        const areInputsValid = fcns.validateNeeded(addressRadio, circleRadio, formEls);

        // Executing logic when all needed inputs are valid
        if  (areInputsValid) {

            // Getting coords for the selected base
            let coords;

            try {

                //Getting coords
                coords = await fcns.getCoords(addressRadio, formEls);
    
            } catch (err) {
    
                fcns.showError('Nepodařilo se získat souřadnice. Zkuste to znovu později.');

                return;
    
            }
            
            // Getting coords of a random place in the selected range
            const [finalLng, finalLat] = fcns.calculateCoordTransform(circleRadio, formEls, coords);
            
            // Constructing URL and redirecting the user to the 'found' page
            const url = new URL(`/views/found.html?lng=${finalLng}&lat=${finalLat}`, document.location.href);
            document.location.href = url;

        } else {

            if (addressRadio.checked) {
                fcns.showError('Alespoň jeden input je neplatný. Zkontrolujte, prosím, zda jste zadali adresu a zda jsou všechna čísla zadaná bez jednotek a případné desetinné řády jsou oddělené tečkou.');
            } else {
                fcns.showError('Alespoň jeden input je neplatný. Zkontrolujte, prosím, zda jsou všechna čísla zadaná bez jednotek a případné desetinné řády jsou oddělené tečkou');
            }

        }
    })

    // Validating input, whenever the user enters sth to it
    for (const input of form.elements) {
        input.addEventListener('input', () => {
            fcns.validateInput(input, formEls);
        })
    }
}

const found = document.querySelector('.found');

////// IF THE CURRENT PAGE IS FOUND

if(found) {

    //Getting longitude and latitude from URLSearchParams
    const params = new URLSearchParams(window.location.search);
    const lat = +params.get('lat');
    const lng = +params.get('lng');
    
    //Finding elements, where the resultcoords will be rendered
    const latEl = document.querySelector('.found__coord-lat');
    const lngEl = document.querySelector('.found__coord-long');
    
    // Rendering the result coords
    latEl.textContent = lat;
    lngEl.textContent = lng;
    
    // Creating a map with result coords in the center

    try {

        //Rendering map
        fcns.createMap(lng, lat);

    } catch (err) {

        fcns.showError('Nepodařilo se získat mapu. Zkuste to znovu později.');

    }
   
    // When user clicks the button, he gets redirected to index.html
    const nextTripBtn = document.getElementById('btn-next-trip');
    nextTripBtn.addEventListener('click', () => {
        const url = new URL(`/views`, document.location.href);
        document.location.href = url;
    })
}
///// EXECUTING ON BOTH PAGES

 // Activating show info about the application button
 const info = document.getElementById('info');
 const infoBtn = document.getElementById('show-info');
 infoBtn.addEventListener('click', () => {
     fcns.showOrHideEl(info, 'info--hidden', 'info--visible', 'info--hiding'); // Changes button styling
     fcns.showOrHideEl(infoBtn, 'header__btn--not-clicked', 'header__btn--clicked', 'header__btn--hiding'); //Shows or hides the info div
 })
    
} catch (err) {
    fcns.showError('Váš prohlížeč zřejmě nepodporuje všechny prvky, které při kódování této aplikace používám. Z toho důvodu je možné, že aplikace nebude fungovat tak, jak by měla.')
}












