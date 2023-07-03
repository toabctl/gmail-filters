// ordering is important here to not create multiple labels
const FILTERS = [
    Is,
    launchpad,
    jira,
    jenkins,
    aws,
    google_cloud,
    mattermost,
    calendar,
    mailing_lists,
];


/*
 * helper function to create labels separated by /
 */
function get_or_create_label(label_name_full:string) {
    const label_parts:string[] = label_name_full.split("/");
    let label_name = ""
    for(i = 0; i < label_parts.length; i++) {
        if(label_parts[i].length == 0) {
            break
        }
        if(i == 0) {
            label_name = label_parts[i]
        } else {
            label_name = label_name + "/" + label_parts[i]
        }
        let label:GmailLabel = GmailApp.getUserLabelByName(label_name);
        if(label == null) {
            label = GmailApp.createLabel(label_name);
            console.log(`created label '${label_name}'`)
        }
    }
    return label;
}


/*
 * Jenkins filter
 */
function jenkins(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];
    const header:str = msg.getHeader("X-Jenkins-Job");
    if(header) {
        const label:GmailLabel = get_or_create_label("jenkins");
        console.log("---> jenkins detected");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    }
    return false;
}


/*
 * Launchpad filter
 */
function launchpad(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];
    const lp_notification_type:str = msg.getHeader("X-Launchpad-Notification-Type");
    if(lp_notification_type && lp_notification_type == "code-review") {
        const label:GmailLabel = get_or_create_label("launchpad/reviews");
        console.log("---> launchpad code review detected");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    } else if (lp_notification_type && lp_notification_type == "bug") {
        const label:GmailLabel = get_or_create_label("launchpad/bugs");
        console.log("---> launchpad bug detected");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    } else if (lp_notification_type && lp_notification_type == "package-upload") {
        const label:GmailLabel = get_or_create_label("launchpad/package-upload");
        console.log("---> launchpad package-upload detected");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    } else if (lp_notification_type && lp_notification_type == "package-build-status") {
        const label:GmailLabel = get_or_create_label("launchpad/package-build");
        console.log("---> launchpad package-build detected");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    } else if (lp_notification_type && lp_notification_type == "snap-build-status") {
        const label:GmailLabel = get_or_create_label("launchpad/snap-build");
        console.log("---> launchpad snap-build detected");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    }
    return false;
}


/*
 * Jira filter
 */
function jira(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];
    const regex: RegEx = /jira@warthogs.atlassian.net/;
    const match = msg.getFrom().match(regex);
    if(match) {
        console.log("---> jira detected")
        const label:GmailLabel = get_or_create_label("jira");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    }
    return false;
}


/*
 * AWS marketplace filter
 */
function aws(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];
    const regex: RegEx = /no-reply@marketplace.aws/;
    const match = msg.getFrom().match(regex);
    if(match) {
        console.log("---> aws marketplace detected")
        const label:GmailLabel = get_or_create_label("aws/marketplace");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    }

    const regex: RegEx = /apn-info@amazon.com/;
    const match = msg.getFrom().match(regex);
    if(match) {
        console.log("---> aws partner network detected")
        const label:GmailLabel = get_or_create_label("aws/partner-network");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    }
    return false;
}

/*
 * google filter
 */
function google_cloud(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];
    const regex: RegEx = /CloudPlatform-noreply@google.com/;
    const match = msg.getFrom().match(regex);
    if(match) {
        console.log("---> google cloud detected")
        const label:GmailLabel = get_or_create_label("google/cloud");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    }
    return false;
}


/*
 * mattermost filter
 */
function mattermost(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];
    const regex: RegEx = /noreply\+chat@canonical.com/;
    const match = msg.getFrom().match(regex);
    if(match) {
        console.log("---> mattermost detected")
        const label:GmailLabel = get_or_create_label("mattermost");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    }
    return false;
}


/*
 * calendar notification filter
 */
function calendar(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];

    const sender:string = msg.getHeader("Sender");
    if(sender) {
        const regex: RegEx = /calendar-notification@google.com/;
        const match = sender.match(regex);
        if(match) {
            console.log("---> calendar detected")
            const label:GmailLabel = get_or_create_label("calendar-notification");
            thread.addLabel(label);
            thread.moveToArchive();
            return true;
        }
    }
    return false;
}


/*
 * IS tickets filter
 */
function Is(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];
    const header:str = msg.getHeader("X-RT-Ticket");
    if(header) {
        const label:GmailLabel = get_or_create_label("IS/tickets");
        console.log("---> IS ticket detected");
        thread.addLabel(label);
        thread.moveToArchive();
        return true;
    }
    return false;
}


/*
 * Any mailing-list labeled by its List-Id filter
 */
function mailing_lists(thread: GmailThread) {
    const msg: GmailMessage = thread.getMessages()[0];
    const list_id:string = msg.getHeader("List-Id");
    if(list_id) {
        const regex: RegEx = /<(?<list_name>.*)>/;
        const match = list_id.match(regex);
        if(match) {
            const list_name:str = match.groups.list_name;
            const [ln, ...ln_server] = list_name.split(".");
            const label_name:str = `lists/${ln_server.join(".")}/${ln}`;
            const label:GmailLabel = get_or_create_label(label_name);
            console.log(`---> mailing list detected: '${list_name}' -> '${label_name}'`);
            thread.addLabel(label);
            thread.moveToArchive();
            return true;
        }
    }
    return false;
}


function main() {
    console.log("Starting gmail-filters ...")

    const position:int = 0
    const increment:int = 100

    // iterate over all mails
    for(;;) {
        console.log(`Fetching ${increment} mails from position ${position} ...`)
        const filter = "in:inbox is:unread"
        const mails = GmailApp.search(`${filter}`, position, increment);
        console.log(`got ${mails.length} mails for filter "${filter}"`)
        //const mails = GmailApp.getInboxThreads(position, increment);
        if(mails.length == 0) {
            // no more mails - stop here
            break
        } else {
            position = position + mails.length
        }

        // now deal with the mail threads
        mails.forEach((thread) => {
            //console.log(`thread (messages: ${thread.getMessageCount()}): '${thread.getFirstMessageSubject()}'`);
            console.log(`thread: "${thread.getFirstMessageSubject()}"`);

            for (filter of FILTERS) {
                if(filter(thread)) return;
                // default move to inbox
                thread.moveToInbox();
            }
        });
    }
}
