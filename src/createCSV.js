const fs = require('fs');
const stringify = require('csv-stringify').stringify

module.exports = function createCSV({records}) {
  const [headers, ...dataList] = records
  const convertValueMap_1 = []
  const convertValueMap_2 = []
  const targetHeader_1 = []
  const targetHeader_2 = []

  const CONVERT_MAP_1 = [
    ["ORDER", "ORDER"],
    ["OrderID", "orderDisplayID"],
    ["DeliveryName", "firstName"],
    ["", "lastName"],
    ["", "companyName"],
    ["DeliveryAddress1", "street1"],
    ["", "street2"],
    ["DeliverySuburb", "cityName"],
    ["DeliveryState", "state"],
    ["DeliveryPostCode", "postcode"],
    ["DestCountry", "countryCode"],
    ["DeliveryPhone", "phone"],
    ["", "customerEmail"],
    ["", "userID"],
    ["", "paymentType"],
    ["Quantity", "totalOrderAmount"],
    ["", "insuranceFee"],
    ["", "shippingServiceCost"],
    ["Leave at door", "shippingInstructions"],
    ["OrderDate", "orderDate"],
    ["Paid", "orderStatus"],
    ["eParcel", "shippingMethod"],
    ["", "consignmentNumber"],
  ]

  const CONVERT_MAP_2 = [
    ["ITEM", "ITEM"],
    ["OrderID", "orderDisplayID"],
    ["ProductCode", "SKU"],
    ["", "title"],
    ["ItemPrice", "price"],
    ["Quantity", "quantity"],
    ["", "weight"],
    ["", "supplierCode"],
    ["", "attributes"],
    ["", "originCountry"],
    ["", "length"],
    ["", "width"],
    ["", "height"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
  ]

  if (headers && headers.length) {
    getMap(CONVERT_MAP_1, targetHeader_1, convertValueMap_1)
    getMap(CONVERT_MAP_2, targetHeader_2, convertValueMap_2)
    function getMap(map, header, valueMap) {
      map.forEach((item) => {
        const [source, target] = item
        header.push(target)
        if (source !== '') {
          const keyIndex = headers.findIndex(key => key === source)
          valueMap.push(keyIndex === -1 ? source : keyIndex)
        } else {
          valueMap.push('')
        }
      })
    }

  }

  const newDataList = dataList.reduce((list, row) => {
    const newRow_1 = []
    const newRow_2 = []

    function getRow(map, newRow) {
      map.forEach((key) => {
        if (typeof key === 'number') {
          newRow.push(row[key])
          return
        }
        if (typeof key === 'string') {
          newRow.push(key)
          return
        }
        newRow.push('')
      })
    }

    getRow(convertValueMap_1, newRow_1)
    getRow(convertValueMap_2, newRow_2)

    list.push(newRow_1)
    list.push(newRow_2)
    return list
  }, [])

  const newCSVData = [targetHeader_1, targetHeader_2, ...newDataList]

  return new Promise((resolve, reject) => {
    stringify(newCSVData, function (errstringify, str) {
      const path = 'tmp/csv/' + Date.now() + '.csv'
      if (errstringify) {
        reject(errstringify)
      }

      //create the files directory if it doesn't exist
      if (!fs.existsSync('tmp/csv/')) {
        fs.mkdirSync('tmp/csv/')
      }
      fs.writeFile(path, str, function (err) {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve(path)
      })
    })
  })
}