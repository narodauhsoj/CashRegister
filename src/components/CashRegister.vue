<script setup lang="ts">
// @ts-nocheck
import { ref } from 'vue'

const file = ref<File | null>()
let fileTextContent = ''
const transactionLedger = ref([])
let fileOutputString = ''
let randomDivisor = 3
const currencies = ref(['USD', 'Euro'])
let selectedCurrency = ref('USD')
const fileLoaded = ref(false)
const outputGenerated = ref(false)

const numberUSD = [100, 50, 20, 10, 5, 1, 0.25, 0.1, 0.05, 0.01]
const textUSD = [
  'Hundreds',
  'Fifties',
  'Twenties',
  'Tens',
  'Fives',
  'Dollars',
  'Quarters',
  'Dimes',
  'Nickels',
  'Pennies'
]
const numberEuro = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01]
const textEuro = [
  'Five Hundreds',
  'Two Hundreds',
  'Hundreds',
  'Fifties',
  'Twenties',
  'Tens',
  'Fives',
  'Twos',
  'Euros',
  'Fifty cents',
  'Twenty cents',
  'Ten cents',
  'Five cents',
  'Two cents',
  'One cents'
]

//uploads the file and sets some flags
function onFileChanged($event: Event) {
  const target = $event.target as HTMLInputElement
  if (target && target.files) {
    file.value = target.files[0]
    let reader = new FileReader()
    reader.onload = function (e) {
      fileTextContent = reader.result as string
      transactionLedger.value = fileTextContent.split('\r\n')
      fileLoaded.value = true
      outputGenerated.value = false
    }
    reader.readAsText(file.value)
  }
}

//in vue, this is how we expose methods that can be called by other components
defineExpose({
  calculateChange
})

//calculates the change to return and writes the result to a file
const calculateAllForFile = () => {
  let owed = 0
  let paid = 0

  for (let i = 0; i < transactionLedger.value.length; i++) {
    var split = transactionLedger.value[i].split(',')
    owed = split[0]
    paid = split[1]
    let changeList = calculateChange(owed, paid)
    fileOutputString = fileOutputString + changeList
    owed = 0
    paid = 0
  }

  //write the fileOutputString to a file
  const blob = new Blob([fileOutputString], { type: 'text/plain' })
  const e = document.createEvent('MouseEvents'),
    a = document.createElement('a')
  a.download = 'test.txt'
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
  outputGenerated.value = true
}

//returns a string that represents the denominations the cashiers should give to the customer
function calculateChange(owed, paid) {
  let change = Math.round((paid - owed) * 100) / 100
  let changeMap = {}
  let needsRandomChange =
    owed != 0 &&
    ((owed % randomDivisor).toFixed(2) == 0 ||
      (owed % (randomDivisor / 10)).toFixed(2) == 0 ||
      (owed % (randomDivisor / 100)).toFixed(2) == 0)

  changeMap = makeChange(change, needsRandomChange)

  let outputString = ''
  for (var i in changeMap) {
    outputString += changeMap[i] + ' ' + i + ', '
  }
  outputString = outputString.slice(0, -2)
  outputString += '\r\n'

  return outputString
}

//returns the optimal denominations for the change required
//starts with the largest denominations, finishes with the smallest.
//returns a hashmap of the denominations
function makeChange(change, needsRandomChange) {
  let denoms = getDenominations()

  let changeMap = {}
  while (change.toFixed(2) > 0) {
    // here if we do not need random change, we will want to use a for loop that tries to get the largest
    // denomination that can be subtracted from the total. after finding it, we must break and start over
    if (!needsRandomChange) {
      for (var j = 0; j < denoms.numberDenoms.length; j++) {
        if (change.toFixed(2) >= denoms.numberDenoms[j]) {
          if (denoms.textDenoms[j] in changeMap) {
            changeMap[denoms.textDenoms[j]]++
          } else {
            changeMap[denoms.textDenoms[j]] = 1
          }
          change = change.toFixed(2) - denoms.numberDenoms[j]
          break
        }
      }
    } else {
      // here if we need random change, we simply pick a number and if it can be subtracted, then we do, and add a coin to the changeMap
      // I realize there is some duplicated code here but the additional complexity of breaking up this code means I'd keep it this way.
      let j = getRandomInt(0, denoms.numberDenoms.length)
      if (change.toFixed(2) >= denoms.numberDenoms[j]) {
        if (denoms.textDenoms[j] in changeMap) {
          changeMap[denoms.textDenoms[j]]++
        } else {
          changeMap[denoms.textDenoms[j]] = 1
        }
        change = change.toFixed(2) - denoms.numberDenoms[j]
      }
    }
  }

  return changeMap
}

//returns the denominations that have been selected by the user for the currency they are using
function getDenominations() {
  let textDenoms = []
  let numberDenoms = []

  if (selectedCurrency.value == 'USD') {
    textDenoms = textUSD
    numberDenoms = numberUSD
  } else if (selectedCurrency.value == 'Euro') {
    textDenoms = textEuro
    numberDenoms = numberEuro
  }

  return { textDenoms: textDenoms, numberDenoms: numberDenoms }
}

//returns a random integer between min (inclusive) and max (exclusive)
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled) // The maximum is exclusive and the minimum is inclusive
}
</script>

<template>
  <div id="registerInputs">
    <div>Cash Register</div>
    <div class="instructionArea">
      Upload your transaction ledger via the button below.<br />
      - Your file should be text format, with each line containing the owed amount first, and the
      paid amount second with a comma separating the two. (for example: 2.13,3.00) Each line should
      have a single transaction. <br />
      - Pressing the 'Calculate Change' button will write to a file that shows the correct
      change/coinage for each transaction, one on each line.
    </div>
    <hr />
    <div id="fileUploadInputs" data-cy="fileUploadInputs">
      <div class="inputArea" data-cy="inputArea">
        <div class="fileArea" data-cy="fileArea">
          <input
            type="file"
            @change="onFileChanged($event)"
            accept="text/json*"
            capture
            class="fileUploadBtn"
            size="50"
            data-cy="fileUploadBtn"
          />
          <div v-if="fileLoaded" data-cy="fileLoaded">File Loaded Successfully!</div>
        </div>
        <div class="currencyArea" data-cy="currencyArea">
          Currency:
          <select
            class="form-select form-control currencySelect"
            v-model="selectedCurrency"
            data-cy="currencySelector"
          >
            <option v-for="currency in currencies" :key="currency[Symbol]">
              {{ currency }}
            </option>
          </select>
        </div>
      </div>
      <button
        id="calculateAll"
        class="calculateBtn"
        data-cy="calculateBtn"
        @click="calculateAllForFile()"
      >
        Calculate Change
      </button>
      <div v-if="outputGenerated" data-cy="outputGenerated">File Written Successfully!</div>
    </div>
  </div>
</template>

<style scoped>
.instructionArea {
  width: 90vw;
}
.inputArea {
  padding-top: 5px;
  padding-bottom: 5px;
  margin-bottom: 5px;
  margin-top: 5px;
  width: 50vw;
  display: flex;
  border: black 1px solid;
}
.currencyArea {
  width: 25vw;
}
.currencySelect {
  width: 70%;
  padding-bottom: 5px;
  padding-top: 5px;
}
.fileUploadBtn {
  padding-bottom: 5px;
  padding-top: 5px;
  margin-left: 2px;
  width: 25vw;
}
.calculateBtn {
  padding: 25px;
  width: 50vw;
}
</style>
