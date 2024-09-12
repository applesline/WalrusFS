// This module is a demo on "method syntax"
// [move 2024][alpha] Method syntax #13933
// you can view this PR for more details:
// https://github.com/MystenLabs/sui/pull/13933
module Move2024001::file_system {

    use std::string::{Self,String};

    public struct Directory has key,store {
        id : UID,
        name:String,
        parent: ID,
        children: vector<ID>
    }

    public struct File has key,store {
        id : UID,
        name:String,
        blob_id: String,
        size: u64,
        parent: ID,
        children: vector<ID>
    }
    
    #[allow(lint(self_transfer))]
    public entry fun create_root_directory(ctx : &mut TxContext) {
        let uid : UID = object::new(ctx);
        let current_id : ID = object::uid_to_inner(&uid);
        let directory: Directory = Directory {
            id : uid,
            name:string::utf8(b"/"),
            parent: current_id,
            children: vector::empty()
        };
        transfer::transfer(directory,tx_context::sender(ctx));
    }

    #[allow(lint(self_transfer))]
    public entry fun create_directory(parent_directory : &mut Directory,name: String,ctx : &mut TxContext) {
        let parent_id : ID = object::uid_to_inner(&parent_directory.id);
        let directory : Directory = Directory {
            id : object::new(ctx),
            name:name,
            parent: parent_id,
            children: vector::empty()
        };
        parent_directory.children.push_back(object::uid_to_inner(&directory.id));
        transfer::transfer(directory,tx_context::sender(ctx));
    }

    #[allow(lint(self_transfer))]
    public entry fun create_file(directory: &mut Directory,blob_id: String, name: String ,ctx : &mut TxContext) {
        let directory_id : ID = object::uid_to_inner(&directory.id);
        let file : File = File {
            id : object::new(ctx),
            name: name,
            blob_id: blob_id,
            size: 0 ,
            parent: directory_id,
            children: vector::empty()
        };
        directory.children.push_back(object::uid_to_inner(&file.id));
        transfer::transfer(file,tx_context::sender(ctx));
    }
    
}

