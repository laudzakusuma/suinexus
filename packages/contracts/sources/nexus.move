// file: packages/contracts/sources/nexus.move
module suinexus::nexus {
    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};
    use std::vector;

    // --- Error Codes ---
    const E_NOT_AUTHORIZED: u64 = 401;

    // --- Struct Definitions ---

    struct EntityObject has key, store {
        id: UID,
        entity_type: String,
        name: String,
        location: String,
        reputation_score: u64,
        owner: address,
    }

    struct DynamicAssetNFT has key, store {
        id: UID,
        owner: address,
        creator: address,
        creation_timestamp_ms: u64,
        name: String,
        description: String,
        current_state: String,
        quantity: u64,
        unit: String,
        history: vector<String>,
    }

    struct ProcessObject has key, store {
        id: UID,
        process_name: String,
        input_asset_id: ID,
        output_asset_id: ID,
        processor_entity_id: ID,
        timestamp_ms: u64,
        notes: String,
    }

    struct InvoiceNFT has key, store {
        id: UID,
        issuer_entity_id: ID,
        beneficiary: address,
        asset_id_reference: ID,
        amount: u64,
        due_date_ms: u64,
        is_paid: bool,
    }

    // --- Events ---
    struct AssetCreated has copy, drop { object_id: ID, creator: address, name: String }
    struct AssetTransferred has copy, drop { object_id: ID, from: address, to: address }
    struct ProcessApplied has copy, drop { process_id: ID, asset_id: ID, processor_id: ID }
    struct InvoiceCreated has copy, drop { invoice_id: ID, issuer_id: ID, beneficiary: address, amount: u64 }

    // --- Entry Functions ---

    public entry fun create_entity(
        entity_type: vector<u8>, name: vector<u8>, location: vector<u8>, ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(EntityObject {
            id: object::new(ctx),
            entity_type: string::utf8(entity_type),
            name: string::utf8(name),
            location: string::utf8(location),
            reputation_score: 0,
            owner: sender,
        }, sender);
    }

    public entry fun create_harvest_batch(
        name: vector<u8>, description: vector<u8>, quantity: u64, unit: vector<u8>, clock: &Clock, ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        let asset = DynamicAssetNFT {
            id: object::new(ctx),
            owner: sender,
            creator: sender,
            creation_timestamp_ms: timestamp,
            name: string::utf8(name),
            description: string::utf8(description),
            current_state: string::utf8(b"HARVESTED"),
            quantity: quantity,
            unit: string::utf8(unit),
            history: vector::singleton(string::utf8(b"HARVESTED")),
        };
        event::emit(AssetCreated { object_id: object::id(&asset), creator: sender, name: asset.name });
        transfer::public_transfer(asset, sender);
    }

    public entry fun transfer_asset_and_create_invoice(
        // DEFINITIVE FIX: Parameter declared as 'mut' to allow modification
        mut asset: DynamicAssetNFT,
        issuer_entity: &EntityObject,
        recipient_addr: address,
        invoice_amount: u64,
        invoice_due_date_ms: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(asset.owner == sender, E_NOT_AUTHORIZED);

        let invoice = InvoiceNFT {
            id: object::new(ctx),
            issuer_entity_id: object::id(issuer_entity),
            beneficiary: sender,
            asset_id_reference: object::id(&asset),
            amount: invoice_amount,
            due_date_ms: invoice_due_date_ms,
            is_paid: false,
        };
        
        event::emit(InvoiceCreated {
            invoice_id: object::id(&invoice),
            issuer_id: object::id(issuer_entity),
            beneficiary: sender,
            amount: invoice.amount,
        });
        transfer::public_transfer(invoice, sender);

        // DEFINITIVE FIX: The invalid "let mut asset = asset;" line is removed.
        let mut history_log = string::utf8(b"TRANSFERRED to ");
        string::append(&mut history_log, issuer_entity.name);
        vector::push_back(&mut asset.history, history_log);
        asset.owner = recipient_addr;

        event::emit(AssetTransferred { object_id: object::id(&asset), from: sender, to: recipient_addr });
        transfer::public_transfer(asset, recipient_addr);
    }

    public entry fun apply_process(
        asset: &mut DynamicAssetNFT,
        processor_entity: &EntityObject,
        process_name: vector<u8>,
        new_state: vector<u8>,
        notes: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == asset.owner, E_NOT_AUTHORIZED);
        
        let timestamp = clock::timestamp_ms(clock);
        asset.current_state = string::utf8(new_state);

        let process = ProcessObject {
            id: object::new(ctx),
            process_name: string::utf8(process_name),
            input_asset_id: object::id(asset),
            output_asset_id: object::id(asset),
            processor_entity_id: object::id(processor_entity),
            timestamp_ms: timestamp,
            notes: string::utf8(notes),
        };

        let mut history_log = string::utf8(b"PROCESSED: ");
        string::append(&mut history_log, process.process_name);
        string::append(&mut history_log, string::utf8(b" by "));
        string::append(&mut history_log, processor_entity.name);
        vector::push_back(&mut asset.history, history_log);
        
        event::emit(ProcessApplied {
            process_id: object::id(&process),
            asset_id: object::id(asset),
            processor_id: process.processor_entity_id,
        });
        transfer::public_transfer(process, tx_context::sender(ctx));
    }
}