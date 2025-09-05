// // src/data/verificationData.js
// const propertiesData = [
//     // Residential Properties
//     { "propertyNo": 1, "name": "Godrej Aristocrat", "status": "underconstructed", "category": "residential", "plotArea": 4724, "floorArea": 1142.86, "widthOfAccess": "", "far": 1.75, "floors": 7, "totalBuildableArea": 8267, "perSqFtCost": 8297 },
//     { "propertyNo": 2, "name": "M3M Altitude", "status": "underconstructed", "category": "residential", "plotArea": 8889, "floorArea": 1666.67, "widthOfAccess": "", "far": 1.75, "floors": 9, "totalBuildableArea": 15555.75, "perSqFtCost": 15555.75 },
//     { "propertyNo": 3, "name": "DLF The Arbour 2", "status": "underconstructed", "category": "residential", "plotArea": 8444, "floorArea": 1769.67, "widthOfAccess": "", "far": 1.75, "floors": 8, "totalBuildableArea": 14777, "perSqFtCost": 14777 },
//     { "propertyNo": 4, "name": "Smart World One DXP", "status": "fullyconstructed", "category": "residential", "plotArea": 5200, "floorArea": 1300, "widthOfAccess": "", "far": 1.75, "floors": 7, "totalBuildableArea": 9100, "perSqFtCost": 9100 },
//     { "propertyNo": 5, "name": "Pinnacle Residences", "status": "fullyconstructed", "category": "residential", "plotArea": 3500, "floorArea": 875, "widthOfAccess": "", "far": 1.75, "floors": 7, "totalBuildableArea": 6125, "perSqFtCost": 6125 },
//     { "propertyNo": 6, "name": "Oasis Greens", "status": "fullyconstructed", "category": "residential", "plotArea": 7800, "floorArea": 1733.33, "widthOfAccess": "", "far": 1.75, "floors": 7, "totalBuildableArea": 13650, "perSqFtCost": 13850 },
//     { "propertyNo": 7, "name": "The Royal Crest", "status": "prospectus", "category": "residential", "plotArea": 6300, "floorArea": 1400, "widthOfAccess": "", "far": 1.75, "floors": 7, "totalBuildableArea": 11025, "perSqFtCost": 11025 },
//     { "propertyNo": 8, "name": "Emerald Heights", "status": "prospectus", "category": "residential", "plotArea": 2800, "floorArea": 933, "widthOfAccess": "", "far": 1.75, "floors": 7, "totalBuildableArea": 4900, "perSqFtCost": 4900 },
//     { "propertyNo": 9, "name": "Silverline Towers", "status": "prospectus", "category": "residential", "plotArea": 8500, "floorArea": 1888.89, "widthOfAccess": "", "far": 1.75, "floors": 7, "totalBuildableArea": 14875, "perSqFtCost": 14875 },
//     { "propertyNo": 10, "name": "The Grandeur", "status": "underconstructed", "category": "commercial", "plotArea": 7245, "floorArea": 3150, "widthOfAccess": "", "far": 1.75, "floors": 4, "totalBuildableArea": 12678.75, "perSqFtCost": 12678.75 },
//     { "propertyNo": 11, "name": "skyline office space", "status": "underconstructed", "category": "commercial", "plotArea": 4500, "floorArea": 2500, "widthOfAccess": "", "far": 3.5, "floors": 6, "totalBuildableArea": 15750, "perSqFtCost": 15750 },
//     { "propertyNo": 12, "name": "urban plaza retail space", "status": "underconstructed", "category": "commercial", "plotArea": 15000, "floorArea": 8000, "widthOfAccess": "", "far": 3.5, "floors": 6, "totalBuildableArea": 52500, "perSqFtCost": 19200 },
//     { "propertyNo": 13, "name": "hypervault data center", "status": "fullyconstructed", "category": "commercial", "plotArea": 9000, "floorArea": 5000, "widthOfAccess": "", "far": 3.5, "floors": 8, "totalBuildableArea": 28000, "perSqFtCost": 28000 },
//     { "propertyNo": 14, "name": "the royals luxury hotel", "status": "fullyconstructed", "category": "commercial", "plotArea": 15000, "floorArea": 6000, "widthOfAccess": "", "far": 3.5, "floors": 11, "totalBuildableArea": 52500, "perSqFtCost": 25000 },
//     { "propertyNo": 15, "name": "meridian convention center", "status": "fullyconstructed", "category": "commercial", "plotArea": 15000, "floorArea": 7500, "widthOfAccess": "", "far": 3.5, "floors": 7, "totalBuildableArea": 56000, "perSqFtCost": 56000 },
//     { "propertyNo": 16, "name": "the food junction", "status": "fullyconstructed", "category": "commercial", "plotArea": 6000, "floorArea": 2900, "widthOfAccess": "", "far": 3.5, "floors": 10, "totalBuildableArea": 21000, "perSqFtCost": 21000 },
//     { "propertyNo": 17, "name": "synergy co working hub", "status": "fullyconstructed", "category": "commercial", "plotArea": 4400, "floorArea": 10000, "widthOfAccess": "", "far": 3.5, "floors": 12, "totalBuildableArea": 49000, "perSqFtCost": 35000 },
//     { "propertyNo": 18, "name": "crestview institution", "status": "fullyconstructed", "category": "commercial", "plotArea": 8000, "floorArea": 3500, "widthOfAccess": "", "far": 3.5, "floors": 12, "totalBuildableArea": 28000, "perSqFtCost": 28000 },
//     { "propertyNo": 19, "name": "greenfield medical center", "status": "prospectus", "category": "commercial", "plotArea": 14000, "floorArea": 6200, "widthOfAccess": "", "far": 3.5, "floors": 12, "totalBuildableArea": 49000, "perSqFtCost": 49000 },
//     { "propertyNo": 20, "name": "quantum IT tower", "status": "prospectus", "category": "commercial", "plotArea": 14000, "floorArea": 7200, "widthOfAccess": "", "far": 3.5, "floors": 6, "totalBuildableArea": 49000, "perSqFtCost": 49000 },
//     { "propertyNo": 21, "name": "Electronic assembly unit", "status": "fully constructed", "category": "industry", "plotArea": 23200, "floorArea": 14500, "widthOfAccess": "24m", "far": 1.25, "floors": 2, "totalBuildableArea": 29000, "perSqFtCost": 28750 },
//     { "propertyNo": 22, "name": "food processing industry", "status": "under constructed", "category": "industry", "plotArea": 40000, "floorArea": 12500, "widthOfAccess": "24m", "far": 1.25, "floors": 4, "totalBuildableArea": 50000, "perSqFtCost": 12000 },
//     { "propertyNo": 23, "name": "pharma manufacturing plant", "status": "fully constructed", "category": "industry", "plotArea": 50000, "floorArea": 31250, "widthOfAccess": "24m", "far": 1.25, "floors": 3, "totalBuildableArea": 62500, "perSqFtCost": 19000 },
//     { "propertyNo": 24, "name": "automotive manufacturing industry", "status": "fully constructed", "category": "industry", "plotArea": 45000, "floorArea": 18750, "widthOfAccess": "24m", "far": 1.25, "floors": 3, "totalBuildableArea": 56250, "perSqFtCost": 4800 },
//     { "propertyNo": 25, "name": "oil industry", "status": "fully constructed", "category": "industry", "plotArea": 36000, "floorArea": 15000, "widthOfAccess": "24m", "far": 1.25, "floors": 3, "totalBuildableArea": 45000, "perSqFtCost": 23500 },
//     { "propertyNo": 26, "name": "Unity Agro Lands", "status": "agriculture", "category": "agriculture", "plotArea": 7.5, "floorArea": 0, "widthOfAccess": "0", "far": 0, "floors": 0, "totalBuildableArea": 6, "perSqFtCost": 0 },
//     { "propertyNo": 27, "name": "Green horizon", "status": "agriculture", "category": "agriculture", "plotArea": 3.75, "floorArea": 0, "widthOfAccess": "0", "far": 0, "floors": 0, "totalBuildableArea": 3, "perSqFtCost": 0 },
//     { "propertyNo": 28, "name": "Sunrise Agro Farms", "status": "agriculture", "category": "agriculture", "plotArea": 8.75, "floorArea": 0, "widthOfAccess": "0", "far": 0, "floors": 0, "totalBuildableArea": 7, "perSqFtCost": 0 },
//     { "propertyNo": 29, "name": "Evergreen Farms", "status": "agriculture", "category": "agriculture", "plotArea": 6.25, "floorArea": 0, "widthOfAccess": "0", "far": 0, "floors": 0, "totalBuildableArea": 5, "perSqFtCost": 0 },
//     { "propertyNo": 30, "name": "Silver Leaf Agriculture", "status": "agriculture", "category": "agriculture", "plotArea": 10, "floorArea": 0, "widthOfAccess": "0", "far": 0, "floors": 0, "totalBuildableArea": 8, "perSqFtCost": 0 }
// ];

// const financialsData = [
//     { "propertyNo": 1, "grandTotal": 75865897.13, "stampDuty": 5310612.8, "registrationFee": 758658.97, "totalCost": 81935168.9, "monthlyRent": 189816.48, "annualRent": 2277797.7, "rentalYield": 0.0278 },
//     { "propertyNo": 2, "grandTotal": 124698700.1, "stampDuty": 8728909.01, "registrationFee": 1246987.0, "totalCost": 134674596.11, "monthlyRent": 312154.56, "annualRent": 3745854.77, "rentalYield": 0.0278 },
//     { "propertyNo": 3, "grandTotal": 196066457.8, "stampDuty": 13724652.05, "registrationFee": 1960664.58, "totalCost": 211751774.43, "monthlyRent": 490899.11, "annualRent": 5890789.33, "rentalYield": 0.0278 },
//     { "propertyNo": 4, "grandTotal": 116584129.1, "stampDuty": 8160889.04, "registrationFee": 1165841.29, "totalCost": 125910859.43, "monthlyRent": 291942.32, "annualRent": 3503307.89, "rentalYield": 0.0278 },
//     { "propertyNo": 5, "grandTotal": 85690843, "stampDuty": 5998359.01, "registrationFee": 856908.43, "totalCost": 92546110.44, "monthlyRent": 214956.46, "annualRent": 2579477.47, "rentalYield": 0.0278 },
//     { "propertyNo": 6, "grandTotal": 63814158, "stampDuty": 4466991.06, "registrationFee": 638141.58, "totalCost": 68919290.64, "monthlyRent": 160027.35, "annualRent": 1920328.28, "rentalYield": 0.0278 },
//     { "propertyNo": 7, "grandTotal": 169364128, "stampDuty": 11855488.96, "registrationFee": 1693641.28, "totalCost": 182913258.24, "monthlyRent": 424858.9, "annualRent": 5098306.78, "rentalYield": 0.0278 },
//     { "propertyNo": 8, "grandTotal": 102046863, "stampDuty": 7143280.41, "registrationFee": 1020468.63, "totalCost": 110210612.04, "monthlyRent": 255956.44, "annualRent": 3071477.21, "rentalYield": 0.0278 },
//     { "propertyNo": 9, "grandTotal": 60470870.03, "stampDuty": 4232960.9, "registrationFee": 604708.7, "totalCost": 65308539.63, "monthlyRent": 151522.99, "annualRent": 1818275.8, "rentalYield": 0.0278 },
//     { "propertyNo": 10, "grandTotal": 207158194.7, "stampDuty": 14501073.63, "registrationFee": 2071581.95, "totalCost": 223730850.28, "monthlyRent": 519541.67, "annualRent": 6234499.94, "rentalYield": 0.0278 },
//     { "propertyNo": 11, "grandTotal": 102489640, "stampDuty": 7174274.8, "registrationFee": 1024896.4, "totalCost": 110688811.2, "monthlyRent": 257005.1, "annualRent": 3084061.07, "rentalYield": 0.0278 },
//     { "propertyNo": 12, "grandTotal": 320982640, "stampDuty": 22468784.8, "registrationFee": 3209826.4, "totalCost": 346661251.2, "monthlyRent": 804903.88, "annualRent": 9658846.58, "rentalYield": 0.0278 },
//     { "propertyNo": 13, "grandTotal": 180698650, "stampDuty": 12648905.5, "registrationFee": 1806986.5, "totalCost": 195154542.0, "monthlyRent": 453159.63, "annualRent": 5437915.57, "rentalYield": 0.0278 },
//     { "propertyNo": 14, "grandTotal": 419984620, "stampDuty": 29398923.4, "registrationFee": 4199846.2, "totalCost": 453583389.6, "monthlyRent": 1053217.82, "annualRent": 12638613.83, "rentalYield": 0.0278 },
//     { "propertyNo": 15, "grandTotal": 395228130, "stampDuty": 27665969.1, "registrationFee": 3952281.3, "totalCost": 426846380.4, "monthlyRent": 991202.9, "annualRent": 11894435.0, "rentalYield": 0.0278 },
//     { "propertyNo": 16, "grandTotal": 136131930, "stampDuty": 9529235.1, "registrationFee": 1361319.3, "totalCost": 147022484.4, "monthlyRent": 341312.01, "annualRent": 4095744.17, "rentalYield": 0.0278 },
//     { "propertyNo": 17, "grandTotal": 159402430, "stampDuty": 11158170.1, "registrationFee": 1594024.3, "totalCost": 172154624.4, "monthlyRent": 399589.85, "annualRent": 4795078.16, "rentalYield": 0.0278 },
//     { "propertyNo": 18, "grandTotal": 225064620, "stampDuty": 15754523.4, "registrationFee": 2250646.2, "totalCost": 243069789.6, "monthlyRent": 564294.12, "annualRent": 6771529.41, "rentalYield": 0.0278 },
//     { "propertyNo": 19, "grandTotal": 391927030, "stampDuty": 27434892.1, "registrationFee": 3919270.3, "totalCost": 423281192.4, "monthlyRent": 982753.32, "annualRent": 11793039.75, "rentalYield": 0.0278 },
//     { "propertyNo": 20, "grandTotal": 284101840, "stampDuty": 19887128.8, "registrationFee": 2841018.4, "totalCost": 306829987.2, "monthlyRent": 713091.37, "annualRent": 8557096.44, "rentalYield": 0.0278 },
//     { "propertyNo": 21, "grandTotal": 821782500, "stampDuty": 57524775.0, "registrationFee": 8217825.0, "totalCost": 887525100.0, "monthlyRent": 2059008.58, "annualRent": 24708102.78, "rentalYield": 0.0278 },
//     { "propertyNo": 22, "grandTotal": 610940000, "stampDuty": 42765800.0, "registrationFee": 6109400.0, "totalCost": 659815200.0, "monthlyRent": 1531779.66, "annualRent": 18381355.96, "rentalYield": 0.0278 },
//     { "propertyNo": 23, "grandTotal": 1140865000, "stampDuty": 79860550.0, "registrationFee": 11408650.0, "totalCost": 1232134200.0, "monthlyRent": 2860470.25, "annualRent": 34325642.76, "rentalYield": 0.0278 },
//     { "propertyNo": 24, "grandTotal": 313280000, "stampDuty": 21929600.0, "registrationFee": 3132800.0, "totalCost": 338342400.0, "monthlyRent": 785623.84, "annualRent": 9427486.08, "rentalYield": 0.0278 },
//     { "propertyNo": 25, "grandTotal": 1023605000, "stampDuty": 71652350.0, "registrationFee": 10236050.0, "totalCost": 1105493400.0, "monthlyRent": 2566054.89, "annualRent": 30792658.68, "rentalYield": 0.0278 },
//     { "propertyNo": 26, "grandTotal": 28332126, "stampDuty": 1983248.82, "registrationFee": 283321.26, "totalCost": 30598696.08, "monthlyRent": 71045.1, "annualRent": 852541.2, "rentalYield": 0.0278 },
//     { "propertyNo": 27, "grandTotal": 28244040, "stampDuty": 1977082.8, "registrationFee": 282440.4, "totalCost": 30503563.2, "monthlyRent": 70838.23, "annualRent": 850058.86, "rentalYield": 0.0278 },
//     { "propertyNo": 28, "grandTotal": 40572305, "stampDuty": 2840061.35, "registrationFee": 405723.05, "totalCost": 43818089.4, "monthlyRent": 101765.89, "annualRent": 1221190.72, "rentalYield": 0.0278 },
//     { "propertyNo": 29, "grandTotal": 23551482, "stampDuty": 1648603.74, "registrationFee": 235514.82, "totalCost": 25435600.56, "monthlyRent": 59063.97, "annualRent": 708767.69, "rentalYield": 0.0278 },
//     { "propertyNo": 30, "grandTotal": 355532634, "stampDuty": 24887284.38, "registrationFee": 3555326.34, "totalCost": 383975244.72, "monthlyRent": 891622.18, "annualRent": 10699466.1, "rentalYield": 0.0278 }
// ];

// export const verificationData = propertiesData.map(prop => {
//     const financialInfo = financialsData.find(f => f.propertyNo === prop.propertyNo);
//     return { ...prop, financials: financialInfo, isVerified: false };
// });

