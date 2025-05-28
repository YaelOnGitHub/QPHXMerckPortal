
export const productStatusEN = {
    title: 'Product Status:',
    values: [
        { value: "all", showTitle:'All' ,title: "All", checked: true, show: true },
        { value: "1", showTitle:'Available' ,title: "Available", class: "available", checked: false, show: true },
        { value: "2", showTitle: 'Training Required', title: "Training Required", class: "training-required", checked: false, show: true },
        { value: "3", showTitle: 'Out Of Stock', title: "Out Of Stock", class: "out-of-stock", checked: false, show: true },
        { value: "4", showTitle: 'Cease Use/Expired', title: "Cease Use/Expired", class: "cease-use-Expired", checked: false, show: true },
        { value: "5", showTitle: 'Monthly Limit Reached', title: "Monthly Limit Reached", class: "monthly-limit-reached", checked: false, show: true },
        { value: "6", showTitle: 'Threshold Exceeded', title: "Threshold Exceeded", class: "threshold-exceeded", checked: false, show: true },
        { value: "7", showTitle: 'Unavailable', title: "Unavailable", class: "unavailable", checked: false, show: true },
        { value: "8", showTitle: 'Cold Chain Order Limit Reached', title: "Cold Chain Order Limit Reached", class: "cold-chain-order-limit-reached", checked: false, show: false },
        { value: "9", showTitle: 'Sample/Promo Order Limit Reached', title: "Sample/Promo Order Limit Reached", class: "sample-promo-order-limit-reached", checked: false, show: false },
        { value: "10",showTitle: 'Not Released for Use',  title: "Not Released for Use", class: "not-released", checked: false, show: false },
        { value: "11",showTitle: 'Missing shipment eligibility', title: "Missing shipment eligibility", class: "missing-shipment", checked: false, show: false },
        { value: "12",showTitle: 'Unavailable', title: "Ineligible", class: "ineligible", checked: false, show: false }

    ]
}