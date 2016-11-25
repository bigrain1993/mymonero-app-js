// Constants

const document_cryptor = require('../symmetric_cryptor/document_cryptor')
const CryptSchemeFieldValueTypes = document_cryptor.CryptSchemeFieldValueTypes
const JSBigInt = require('../cryptonote_utils/biginteger').BigInteger
//
//
const documentCryptScheme =
{
	public_address: { type: CryptSchemeFieldValueTypes.String },
	account_seed: { type: CryptSchemeFieldValueTypes.String },
	public_keys: { type: CryptSchemeFieldValueTypes.JSON },
		// view
		// spend
	private_keys: { type: CryptSchemeFieldValueTypes.JSON },
		// view
		// spend
	//
	heights: { type: CryptSchemeFieldValueTypes.JSON },
		// account_scanned_height
		// account_scanned_tx_height
		// account_scanned_block_height
		// account_scan_start_height
		// transaction_height
		// blockchain_height
	totals: { type: CryptSchemeFieldValueTypes.JSON },
		// total_received
		// locked_balance
		// total_sent
	//
	transactions: { type: CryptSchemeFieldValueTypes.Array },
	spent_outputs: { type: CryptSchemeFieldValueTypes.Array }
}
exports.DocumentCryptScheme = documentCryptScheme
//
const CollectionName = "Wallets"
exports.CollectionName = CollectionName


// Utility functions
function HydrateInstance_withUnencryptedValues(
	walletInstance,
	encryptedDocument
)
{
	const self = walletInstance
	//
	// console.log("encryptedDocument", encryptedDocument)
	self.isLoggedIn = encryptedDocument.isLoggedIn
	self.dateThatLast_fetchedAccountInfo = encryptedDocument.dateThatLast_fetchedAccountInfo
	self.dateThatLast_fetchedAccountTransactions = encryptedDocument.dateThatLast_fetchedAccountTransactions
	//
	self.dateWalletFirstSavedLocally = encryptedDocument.dateWalletFirstSavedLocally
	//
	self.mnemonic_wordsetName = encryptedDocument.mnemonic_wordsetName
	self.wallet_currency = encryptedDocument.wallet_currency
	self.walletLabel = encryptedDocument.walletLabel
	//
	self.isInViewOnlyMode = encryptedDocument.isInViewOnlyMode
}
exports.HydrateInstance_withUnencryptedValues = HydrateInstance_withUnencryptedValues
//
function HydrateInstance_withDecryptedValues(
	walletInstance,
	plaintextDocument
)
{
	const self = walletInstance
	//
	// console.log("plaintextDocument", plaintextDocument)
	self.account_seed = plaintextDocument.account_seed
	self.private_keys = plaintextDocument.private_keys
	self.public_address = plaintextDocument.public_address
	self.public_keys = plaintextDocument.public_keys
	self.isInViewOnlyMode = plaintextDocument.isInViewOnlyMode
	//
	self.transactions = plaintextDocument.transactions // no || [] because we always persist at least []
	//
	// unpacking heights…
	const heights = plaintextDocument.heights // no || {} because we always persist at least {}
	self.account_scanned_height = heights.account_scanned_height
	self.account_scanned_tx_height = heights.account_scanned_tx_height
	self.account_scanned_block_height = heights.account_scanned_block_height
	self.account_scan_start_height = heights.account_scan_start_height
	self.transaction_height = heights.transaction_height
	self.blockchain_height = heights.blockchain_height
	//
	// unpacking totals
	const totals = plaintextDocument.totals
	// console.log("totals " , totals)
	self.total_received = new JSBigInt(totals.total_received) // persisted as string
	self.locked_balance = new JSBigInt(totals.locked_balance) // persisted as string
	self.total_sent = new JSBigInt(totals.total_sent) // persisted as string
	//
	self.spent_outputs = plaintextDocument.spent_outputs // no || [] because we always persist at least []
}
exports.HydrateInstance_withDecryptedValues = HydrateInstance_withDecryptedValues


//
function SaveToDisk(
	walletInstance,
	fn
)
{
	const self = walletInstance
	console.log("📝  Saving wallet to disk ", self.Description())
	//
	const persistencePassword = self.persistencePassword
	if (persistencePassword === null || typeof persistencePassword === 'undefined' || persistencePassword === '') {
		const errStr = "❌  Cannot save wallet to disk as persistencePassword was missing."
		const err = new Error(errStr)
		fn(err)
		return
	}
	//
	const heights = {} // to construct:
	if (self.account_scanned_tx_height !== null && typeof self.account_scanned_tx_height !== 'undefined') {
		heights["account_scanned_tx_height"] = self.account_scanned_tx_height
	}
	if (self.account_scanned_height !== null && typeof self.account_scanned_height !== 'undefined') {
		heights["account_scanned_height"] = self.account_scanned_height
	}
	if (self.account_scanned_block_height !== null && typeof self.account_scanned_block_height !== 'undefined') {
		heights["account_scanned_block_height"] = self.account_scanned_block_height
	}
	if (self.account_scan_start_height !== null && typeof self.account_scan_start_height !== 'undefined') {
		heights["account_scan_start_height"] = self.account_scan_start_height
	}
	if (self.transaction_height !== null && typeof self.transaction_height !== 'undefined') {
		heights["transaction_height"] = self.transaction_height
	}
	if (self.blockchain_height !== null && typeof self.blockchain_height !== 'undefined') {
		heights["blockchain_height"] = self.blockchain_height
	}
	//
	const totals = {} // we store all of these as strings since the totals are JSBigInts
	if (self.total_received !== null && typeof self.total_received !== 'undefined') {
		totals["total_received"] = self.total_received.toString()
	}
	if (self.locked_balance !== null && typeof self.locked_balance !== 'undefined') {
		totals["locked_balance"] = self.locked_balance.toString()
	}
	if (self.total_sent !== null && typeof self.total_sent !== 'undefined') {
		totals["total_sent"] = self.total_sent.toString()
	}
	//
	if (typeof self.dateWalletFirstSavedLocally === 'undefined') {
		self.dateWalletFirstSavedLocally = new Date()
	}
	//
	const plaintextDocument =
	{
		walletLabel: self.walletLabel,
		wallet_currency: self.wallet_currency,
		mnemonic_wordsetName: self.mnemonic_wordsetName,
		//
		account_seed: self.account_seed,
		private_keys: self.private_keys,
		public_address: self.public_address,
		public_keys: self.public_keys,
		//
		isLoggedIn: self.isLoggedIn,
		dateThatLast_fetchedAccountInfo: self.dateThatLast_fetchedAccountInfo,
		dateThatLast_fetchedAccountTransactions: self.dateThatLast_fetchedAccountTransactions,
		dateWalletFirstSavedLocally: self.dateWalletFirstSavedLocally,
		//
		isInViewOnlyMode: self.isInViewOnlyMode,
		//
		transactions: self.transactions || [], // maybe not fetched yet
		heights: heights,
		totals: totals,
		spent_outputs: self.spent_outputs || [] // maybe not fetched yet
	}
	// console.log("debug info: going to save plaintextDocument", plaintextDocument)
	// console.log("type of account_scanned_height", typeof plaintextDocument.heights.account_scanned_height)
	// console.log("totals", JSON.stringify(plaintextDocument.totals))
	// console.log("parsed", JSON.parse(JSON.stringify(plaintextDocument.totals)))
	//
	const encryptedDocument = document_cryptor.New_EncryptedDocument(
		plaintextDocument,
		documentCryptScheme,
		persistencePassword
	)
	// console.log("debug info: going to save encryptedDocument", encryptedDocument)
	//
	// insert & update fn declarations for imminent usage…
	function _proceedTo_insertNewDocument()
	{
		self.context.persister.InsertDocument(
			CollectionName,
			encryptedDocument,
			function(
				err,
				newDocument
			)
			{
				if (err) {
					console.error("Error while saving wallet:", err)
					fn(err)
					return
				}
				if (newDocument._id === null) { // not that this would happen…
					fn(new Error("❌  Inserted wallet but _id after saving was null"))
					return // bail
				}
				self._id = newDocument._id // so we have it in runtime memory now…
				console.log("✅  Saved newly inserted wallet with _id " + self._id + ".")
				fn()
			}
		)
	}
	function _proceedTo_updateExistingDocument()
	{
		var query =
		{
			_id: self._id // we want to update the existing one
		}
		var update = encryptedDocument
		var options =
		{
			multi: false,
			upsert: false, // we are only using .update because we know the document exists
			returnUpdatedDocs: true
		}
		self.context.persister.UpdateDocuments(
			CollectionName,
			query,
			update,
			options,
			function(
				err,
				numAffected,
				affectedDocuments,
				upsert
			)
			{

				if (err) {
					console.error("Error while saving wallet:", err)
					fn(err)
					return
				}
				var affectedDocument
				if (Array.isArray(affectedDocuments)) {
					affectedDocument = affectedDocuments[0]
				} else {
					affectedDocument = affectedDocuments
				}
				if (affectedDocument._id === null) { // not that this would happen…
					fn(new Error("❌  Updated wallet but _id after saving was null"))
					return // bail
				}
				if (affectedDocument._id !== self._id) {
					fn(new Error("❌  Updated wallet but _id after saving was not equal to non-null _id before saving"))
					return // bail
				}
				if (numAffected === 0) {
					fn(new Error("❌  Number of documents affected by _id'd update was 0"))
					return // bail
				}
				console.log("✅  Saved update to wallet with _id " + self._id + ".")
				fn()
			}
		)
	}
	//
	if (self._id === null) {
		_proceedTo_insertNewDocument()
	} else {
		_proceedTo_updateExistingDocument()
	}
}
exports.SaveToDisk = SaveToDisk
//
function DeleteFromDisk(
	instance,
	fn
)
{
	const self = instance
	console.log("📝  Deleting wallet ", self.Description())
	const query =
	{
		_id: self._id
	}
	const options = {}
	self.context.persister.RemoveDocuments(
		CollectionName,
		query,
		options,
		function(
			err,
			numRemoved
		)
		{
			if (err) {
				console.error("Error while removing wallet:", err)
				fn(err)
				return
			}
			if (numRemoved === 0) {
				fn(new Error("❌  Number of documents removed by _id'd remove was 0"))
				return // bail
			}
			console.log("🗑  Deleted saved wallet with _id " + self._id + ".")
			fn()
		}
	)
}
exports.DeleteFromDisk = DeleteFromDisk
