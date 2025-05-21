import OpenPipe from 'openpipe/client'

const openpipe = new OpenPipe({
	apiKey: process.env.OPENPIPE_API_KEY as string
})

const { id: datasetId } = await openpipe.createDataset({
	name: 'test'
})

console.log(`Dataset created: ${datasetId}`)

const { entries_created } = await openpipe.createDatasetEntries(datasetId, {
	entries: [
		// MIN 10
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of Tasmania?' },
				{ role: 'assistant', content: '{"city": "Hobart"}' }
			],
			split: 'TRAIN'
			// rejected_message: { role: 'assistant', content: '{"city": "Paris"}' }
			// tools: [],
			// tool_choice: 'required',
			// response_format: {
			// 	type: 'json_schema',
			// 	json_schema: {
			// 		name: 'weather',
			// 		description: 'The weather in the city',
			// 		strict: true,
			// 		schema: {
			// 			type: 'object',
			// 			properties: {
			// 				city: {
			// 					type: 'string',
			// 					description: 'The city'
			// 				}
			// 			},
			// 			required: ['city'],
			// 			additionalProperties: false
			// 		}
			// 	}
			// }
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of Ireland?' },
				{ role: 'assistant', content: '{"city": "Dublin"}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of Australia?' },
				{ role: 'assistant', content: '{"city": "Sydney"}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of The United States?' },
				{ role: 'assistant', content: '{"city": "Washington, D.C."}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of The United Kingdom?' },
				{ role: 'assistant', content: '{"city": "London"}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of The United Kingdom?' },
				{ role: 'assistant', content: '{"city": "London"}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of The United Kingdom?' },
				{ role: 'assistant', content: '{"city": "London"}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of The United Kingdom?' },
				{ role: 'assistant', content: '{"city": "London"}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of The United Kingdom?' },
				{ role: 'assistant', content: '{"city": "London"}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of The United Kingdom?' },
				{ role: 'assistant', content: '{"city": "London"}' }
			],
			split: 'TRAIN'
		},
		{
			messages: [
				{ role: 'system', content: 'You are a helpful assistant' },
				{ role: 'user', content: 'What is the capital of Canada?' },
				{ role: 'assistant', content: '{"city": "Ottawa"}' }
			],
			split: 'TEST'
		}
	]
})

console.log(`Entries created: ${entries_created}`)

// wait 10 seconds (OP takes a while to process the dataset)
await new Promise(resolve => setTimeout(resolve, 10000))

const slug = `BLOX_${Math.random().toString(36).substring(2, 15)}`

const { id: modelId } = await openpipe.createModel({
	datasetId,
	slug,
	trainingConfig: {
		provider: 'openpipe',
		baseModel: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
		enable_sft: true,
		sft_hyperparameters: {
			batch_size: 'auto',
			learning_rate_multiplier: 1,
			num_epochs: 10
		}
	}
})

console.log(`Model created: ${modelId} (${slug})`)

const model = await openpipe.getModel(slug)

const {
	openpipe: { status }
} = model

console.log(`Model [${slug}] status: ${status}`)

const intervalId = setInterval(async () => {
	const {
		openpipe: { status, errorMessage }
	} = await openpipe.getModel(slug)

	console.log(`Model [${slug}] status: ${status}`)
	switch (status) {
		case 'QUEUED':
			console.log('Queued...')
			break
		case 'PENDING':
			console.log('Pending...')
			break
		case 'PROVISIONING':
			console.log('Provisioning...')
			break
		case 'TRAINING':
			console.log('Training...')
			// console.log(model)
			break
		case 'DEPLOYED':
			console.log('Deployment complete!')
			clearInterval(intervalId)
			break
		case 'ERROR':
			console.log('Failed...')
			console.log(errorMessage)
			clearInterval(intervalId)
			break
	}
}, 1000)
