
/**
* Configuration of official and no official datasets. 
* Each official dataset corresponds to one category (identified by dataset ID and json ID).
* 
* The citizens' datasets ID is "bilbon-user-pois", and contains POIs of diffetent categories.
* In this case is neccesary to specify 'categoryCustomNumericId' property, e.g. to associate POIs of a concrete
* category to its corresponding icons, or to manage POI data when one is created by a citizen.
*
* 'categoryCustomNumericId' property is used in this app to manage categories in the same way, but really official
* POIs are separated in different datasets and citizens' POIs are all in the same dataset.
* 'es_ES', 'eu_ES' and 'en_EN' parameters of citizens' POIs are null because they do not appear in the filter's menu.
*
* There can not be two items with the same 'categoryCustomNumericId' and 'isOfficial' properties.
* ('id' property's range must be 0..N)
*/
var categories = [
	{"id":0, "datasetId": "restaurantes-sidrerias-y-bodegas-de-euskadi", 
			 "jsonId": "08560d52-c8ca-484b-9797-13309f056564", 
			 "categoryCustomNumericId": 1,
			 "es_ES": "Restaurantes, sidrerías y bodegas", 
			 "eu_ES": "Jatetxe, sagardotegi eta upeltegiak", 
			 "en_EN": "Restaurants, cider bars and wineries",
			 "marker": "img/categories_icons/gastronomy.png",
			 "isOfficial": true },

	{"id":1, "datasetId": "oficinas-de-turismo-de-euskadi", 
			 "jsonId": "94537200-5d08-44ce-a366-c6075ddff6a2",
			 "categoryCustomNumericId": 2,
			 "es_ES": "Oficinas de turismo", 
			 "eu_ES":"Turismo bulegoak", 
			 "en_EN": "Tourism offices",
			 "marker": "img/categories_icons/tourism.png",
			 "isOfficial": true },

	{"id":2, "datasetId": "alojamientos-turisticos-de-euskadi", 
			 "jsonId": "78a18256-cfba-4f51-825f-7e2e0f48b822", 
			 "categoryCustomNumericId": 3,
			 "es_ES": "Alojamientos turísticos", 
			 "eu_ES": "Ostatu turistikoak", 
			 "en_EN": "Tourist accommodations",
			 "marker": "img/categories_icons/accommodation.png" ,
			 "isOfficial": true },




	{"id":3, "datasetId": "bilbon-user-pois", 
			 "jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
			 "categoryCustomNumericId": 1,
			 "es_ES": null, 
			 "eu_ES": null, 
			 "en_EN": null,
			 "marker": "img/categories_icons/gastronomy_citizen.png",
			 "isOfficial": false },

	{"id":4, "datasetId": "bilbon-user-pois",
			 "jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
			 "categoryCustomNumericId": 2, 
			 "es_ES": null, 
			 "eu_ES": null, 
			 "en_EN": null,
			 "marker": "img/categories_icons/tourism_citizen.png",
			 "isOfficial": false },

	{"id":5, "datasetId": "bilbon-user-pois", 
			 "jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
			 "categoryCustomNumericId": 3,
			 "es_ES": null, 
			 "eu_ES": null,
			 "en_EN": null, 
			 "marker": "img/categories_icons/accommodation_citizen.png",
			 "isOfficial": false }
];