"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dialog_1 = require("./dialog");
const memory_1 = require("./memory");
const dialogContainer_1 = require("./dialogContainer");
const dialogEvents_1 = require("./dialogEvents");
const dialogTurnStateConstants_1 = require("./dialogTurnStateConstants");
/**
 * @private
 */
const ACTIVITY_RECEIVED_EMITTED = Symbol('ActivityReceivedEmitted');
/**
 * The context for the current dialog turn with respect to a specific [DialogSet](xref:botbuilder-dialogs.DialogSet).
 *
 * @remarks
 * This includes the turn context, information about the dialog set, and the state of the dialog stack.
 *
 * From code outside of a dialog in the set, use [DialogSet.createContext](xref:botbuilder-dialogs.DialogSet.createContext)
 * to create the dialog context. Then use the methods of the dialog context to manage the progression of dialogs in the set.
 *
 * When you implement a dialog, the dialog context is a parameter available to the various methods you override or implement.
 *
 * For example:
 * ```JavaScript
 * const dc = await dialogs.createContext(turnContext);
 * const result = await dc.continueDialog();
 * ```
 */
class DialogContext {
    constructor(dialogsOrDC, contextOrDC, state) {
        if (dialogsOrDC instanceof DialogContext) {
            this.dialogs = dialogsOrDC.dialogs;
            this.context = dialogsOrDC.context;
            this.stack = dialogsOrDC.stack;
            this.state = dialogsOrDC.state;
            this.parent = dialogsOrDC.parent;
        }
        else {
            if (!Array.isArray(state.dialogStack)) {
                state.dialogStack = [];
            }
            if (contextOrDC instanceof DialogContext) {
                this.context = contextOrDC.context;
                this.parent = contextOrDC;
            }
            else {
                this.context = contextOrDC;
            }
            this.dialogs = dialogsOrDC;
            this.stack = state.dialogStack;
            this.state = new memory_1.DialogStateManager(this);
            this.state.setValue(memory_1.TurnPath.activity, this.context.activity);
        }
    }
    /**
     * Returns the state information for the dialog on the top of the dialog stack, or `undefined` if
     * the stack is empty.
     */
    get activeDialog() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
    }
    /**
     * Returns dialog context for child if the active dialog is a container.
     */
    get child() {
        var instance = this.activeDialog;
        if (instance != undefined) {
            // Is active dialog a container?
            const dialog = this.findDialog(instance.id);
            if (dialog instanceof dialogContainer_1.DialogContainer) {
                return dialog.createChildContext(this);
            }
        }
        return undefined;
    }
    /**
     * Returns the current dialog manager instance.
     */
    get dialogManager() {
        return this.context.turnState.get(dialogTurnStateConstants_1.DialogTurnStateConstants.dialogManager);
    }
    /**
     * Starts a dialog instance and pushes it onto the dialog stack.
     * Creates a new instance of the dialog and pushes it onto the stack.
     *
     * @param dialogId ID of the dialog to start.
     * @param options Optional. Arguments to pass into the dialog when it starts.
     *
     * @remarks
     * If there's already an active dialog on the stack, that dialog will be paused until
     * it is again the top dialog on the stack.
     *
     * The [status](xref:botbuilder-dialogs.DialogTurnResult.status) of returned object describes
     * the status of the dialog stack after this method completes.
     *
     * This method throws an exception if the requested dialog can't be found in this dialog context
     * or any of its ancestors.
     *
     * For example:
     * ```JavaScript
     * const result = await dc.beginDialog('greeting', { name: user.name });
     * ```
     *
     * **See also**
     * - [endDialog](xref:botbuilder-dialogs.DialogContext.endDialog)
     * - [prompt](xref:botbuilder-dialogs.DialogContext.prompt)
     * - [replaceDialog](xref:botbuilder-dialogs.DialogContext.replaceDialog)
     * - [Dialog.beginDialog](xref:botbuilder-dialogs.Dialog.beginDialog)
     */
    beginDialog(dialogId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Lookup dialog
            const dialog = this.findDialog(dialogId);
            if (!dialog) {
                throw new Error(`DialogContext.beginDialog(): A dialog with an id of '${dialogId}' wasn't found.`);
            }
            // Push new instance onto stack.
            const instance = {
                id: dialogId,
                state: {}
            };
            this.stack.push(instance);
            // Call dialogs begin() method.
            return yield dialog.beginDialog(this, options);
        });
    }
    /**
     * Cancels all dialogs on the dialog stack, and clears stack.
     *
     * @param cancelParents Optional. If `true` all parent dialogs will be cancelled as well.
     * @param eventName Optional. Name of a custom event to raise as dialogs are cancelled. This defaults to [cancelDialog](xref:botbuilder-dialogs.DialogEvents.cancelDialog).
     * @param eventValue Optional. Value to pass along with custom cancellation event.
     *
     * @remarks
     * This calls each dialog's [Dialog.endDialog](xref:botbuilder-dialogs.Dialog.endDialog) method before
     * removing the dialog from the stack.
     *
     * If there were any dialogs on the stack initially, the [status](xref:botbuilder-dialogs.DialogTurnResult.status)
     * of the return value is [cancelled](xref:botbuilder-dialogs.DialogTurnStatus.cancelled); otherwise, it's
     * [empty](xref:botbuilder-dialogs.DialogTurnStatus.empty).
     *
     * This example clears a dialog stack, `dc`, before starting a 'bookFlight' dialog.
     * ```JavaScript
     * await dc.cancelAllDialogs();
     * return await dc.beginDialog('bookFlight');
     * ```
     *
     * **See also**
     * - [endDialog](xref:botbuilder-dialogs.DialogContext.endDialog)
     */
    cancelAllDialogs(cancelParents = false, eventName, eventValue) {
        return __awaiter(this, void 0, void 0, function* () {
            eventName = eventName || dialogEvents_1.DialogEvents.cancelDialog;
            if (this.stack.length > 0 || this.parent != undefined) {
                // Cancel all local and parent dialogs while checking for interception
                let notify = false;
                let dc = this;
                while (dc != undefined) {
                    if (dc.stack.length > 0) {
                        // Check to see if the dialog wants to handle the event
                        // - We skip notifying the first dialog which actually called cancelAllDialogs()
                        if (notify) {
                            const handled = yield dc.emitEvent(eventName, eventValue, false, false);
                            if (handled) {
                                break;
                            }
                        }
                        // End the active dialog
                        yield dc.endActiveDialog(dialog_1.DialogReason.cancelCalled);
                    }
                    else {
                        dc = cancelParents ? dc.parent : undefined;
                    }
                    notify = true;
                }
                return { status: dialog_1.DialogTurnStatus.cancelled };
            }
            else {
                return { status: dialog_1.DialogTurnStatus.empty };
            }
        });
    }
    /**
     * Searches for a dialog with a given ID.
     *
     * @param dialogId ID of the dialog to search for.
     *
     * @remarks
     * If the dialog to start is not found in the [DialogSet](xref:botbuilder-dialogs.DialogSet) associated
     * with this dialog context, it attempts to find the dialog in its parent dialog context.
     *
     * **See also**
     * - [dialogs](xref:botbuilder-dialogs.DialogContext.dialogs)
     * - [parent](xref:botbuilder-dialogs.DialogContext.parent)
     */
    findDialog(dialogId) {
        let dialog = this.dialogs.find(dialogId);
        if (!dialog && this.parent) {
            dialog = this.parent.findDialog(dialogId);
        }
        return dialog;
    }
    prompt(dialogId, promptOrOptions, choices) {
        return __awaiter(this, void 0, void 0, function* () {
            let options;
            if ((typeof promptOrOptions === 'object' &&
                promptOrOptions.type !== undefined) ||
                typeof promptOrOptions === 'string') {
                options = { prompt: promptOrOptions };
            }
            else {
                options = Object.assign({}, promptOrOptions);
            }
            if (choices) {
                options.choices = choices;
            }
            return this.beginDialog(dialogId, options);
        });
    }
    /**
     * Continues execution of the active dialog, if there is one, by passing this dialog context to its
     * [Dialog.continueDialog](xref:botbuilder-dialogs.Dialog.continueDialog) method.
     *
     * @remarks
     * After the call completes, you can check the turn context's [responded](xref:botbuilder-core.TurnContext.responded)
     * property to determine if the dialog sent a reply to the user.
     *
     * The [status](xref:botbuilder-dialogs.DialogTurnResult.status) of returned object describes
     * the status of the dialog stack after this method completes.
     *
     * Typically, you would call this from within your bot's turn handler.
     *
     * For example:
     * ```JavaScript
     * const result = await dc.continueDialog();
     * if (result.status == DialogTurnStatus.empty && dc.context.activity.type == ActivityTypes.message) {
     *     // Send fallback message
     *     await dc.context.sendActivity(`I'm sorry. I didn't understand.`);
     * }
     * ```
     */
    continueDialog() {
        return __awaiter(this, void 0, void 0, function* () {
            // if we are continuing and haven't emitted the activityReceived event, emit it
            // NOTE: This is backward compatible way for activity received to be fired even if you have legacy dialog loop
            if (!this.context.turnState.has(ACTIVITY_RECEIVED_EMITTED)) {
                this.context.turnState.set(ACTIVITY_RECEIVED_EMITTED, true);
                // Dispatch "activityReceived" event
                // - This fired from teh leaf and will queue up any interruptions.
                yield this.emitEvent(dialogEvents_1.DialogEvents.activityReceived, this.context.activity, true, true);
            }
            // Check for a dialog on the stack
            const instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.findDialog(instance.id);
                if (!dialog) {
                    // throw new Error(`DialogContext.continueDialog(): Can't continue dialog. A dialog with an id of '${instance.id}' wasn't found.`);

                    return { status: dialog_1.DialogTurnStatus.empty };
                }
                // Continue execution of dialog
                return yield dialog.continueDialog(this);
            }
            else {
                return { status: dialog_1.DialogTurnStatus.empty };
            }
        });
    }
    /**
     * Ends a dialog and pops it off the stack. Returns an optional result to the dialog's parent.
     *
     * @param result Optional. A result to pass to the parent logic. This might be the next dialog
     *      on the stack, or if this was the last dialog on the stack, a parent dialog context or
     *      the bot's turn handler.
     *
     * @remarks
     * The _parent_ dialog is the next dialog on the dialog stack, if there is one. This method
     * calls the parent's [Dialog.resumeDialog](xref:botbuilder-dialogs.Dialog.resumeDialog) method,
     * passing the result returned by the ending dialog. If there is no parent dialog, the turn ends
     * and the result is available to the bot through the returned object's
     * [result](xref:botbuilder-dialogs.DialogTurnResult.result) property.
     *
     * The [status](xref:botbuilder-dialogs.DialogTurnResult.status) of returned object describes
     * the status of the dialog stack after this method completes.
     *
     * Typically, you would call this from within the logic for a specific dialog to signal back to
     * the dialog context that the dialog has completed, the dialog should be removed from the stack,
     * and the parent dialog should resume.
     *
     * For example:
     * ```JavaScript
     * return await dc.endDialog(returnValue);
     * ```
     *
     * **See also**
     * - [beginDialog](xref:botbuilder-dialogs.DialogContext.beginDialog)
     * - [replaceDialog](xref:botbuilder-dialogs.DialogContext.replaceDialog)
     * - [Dialog.endDialog](xref:botbuilder-dialogs.Dialog.endDialog)
     */
    endDialog(result) {
        return __awaiter(this, void 0, void 0, function* () {
            // End the active dialog
            yield this.endActiveDialog(dialog_1.DialogReason.endCalled, result);
            // Resume parent dialog
            const instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.findDialog(instance.id);
                if (!dialog) {
                    // throw new Error(`DialogContext.endDialog(): Can't resume previous dialog. A dialog with an id of '${instance.id}' wasn't found.`);

                    // Signal completion
                    return { status: dialog_1.DialogTurnStatus.complete, result: result };
                }
                // Return result to previous dialog
                return yield dialog.resumeDialog(this, dialog_1.DialogReason.endCalled, result);
            }
            else {
                return { status: dialog_1.DialogTurnStatus.complete, result: result };
            }
        });
    }
    /**
     * Ends the active dialog and starts a new dialog in its place.
     *
     * @param dialogId ID of the dialog to start.
     * @param options Optional. Arguments to pass into the new dialog when it starts.
     *
     * @remarks
     * This is particularly useful for creating a loop or redirecting to another dialog.
     *
     * The [status](xref:botbuilder-dialogs.DialogTurnResult.status) of returned object describes
     * the status of the dialog stack after this method completes.
     *
     * This method is similar to ending the current dialog and immediately beginning the new one.
     * However, the parent dialog is neither resumed nor otherwise notified.
     *
     * **See also**
     * - [beginDialog](xref:botbuilder-dialogs.DialogContext.beginDialog)
     * - [endDialog](xref:botbuilder-dialogs.DialogContext.endDialog)
     */
    replaceDialog(dialogId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // End the active dialog
            yield this.endActiveDialog(dialog_1.DialogReason.replaceCalled);
            // Start replacement dialog
            return yield this.beginDialog(dialogId, options);
        });
    }
    /**
     * Requests the active dialog to re-prompt the user for input.
     *
     * @remarks
     * This calls the active dialog's [repromptDialog](xref:botbuilder-dialogs.Dialog.repromptDialog) method.
     *
     * For example:
     * ```JavaScript
     * await dc.repromptDialog();
     * ```
     */
    repromptDialog() {
        return __awaiter(this, void 0, void 0, function* () {
            // Try raising event first
            const handled = yield this.emitEvent(dialogEvents_1.DialogEvents.repromptDialog, undefined, false, false);
            if (!handled) {
                // Check for a dialog on the stack
                const instance = this.activeDialog;
                if (instance) {
                    // Lookup dialog
                    const dialog = this.findDialog(instance.id);
                    if (!dialog) {
                        throw new Error(`DialogSet.reprompt(): Can't find A dialog with an id of '${instance.id}'.`);
                    }
                    // Ask dialog to re-prompt if supported
                    yield dialog.repromptDialog(this.context, instance);
                }
            }
        });
    }
    /**
     * Searches for a dialog with a given ID.
     * @remarks
     * Emits a named event for the current dialog, or someone who started it, to handle.
     * @param name Name of the event to raise.
     * @param value Optional. Value to send along with the event.
     * @param bubble Optional. Flag to control whether the event should be bubbled to its parent if not handled locally. Defaults to a value of `true`.
     * @param fromLeaf Optional. Whether the event is emitted from a leaf node.
     * @returns `true` if the event was handled.
     */
    emitEvent(name, value, bubble = true, fromLeaf = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize event
            const dialogEvent = {
                bubble: bubble,
                name: name,
                value: value,
            };
            // Find starting dialog
            let dc = this;
            if (fromLeaf) {
                while (true) {
                    const childDc = dc.child;
                    if (childDc != undefined) {
                        dc = childDc;
                    }
                    else {
                        break;
                    }
                }
            }
            // Dispatch to active dialog first
            // - The active dialog will decide if it should bubble the event to its parent.
            const instance = dc.activeDialog;
            if (instance != undefined) {
                const dialog = dc.findDialog(instance.id);
                if (dialog != undefined) {
                    return yield dialog.onDialogEvent(dc, dialogEvent);
                }
            }
            return false;
        });
    }
    endActiveDialog(reason, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.findDialog(instance.id);
                if (dialog) {
                    // Notify dialog of end
                    yield dialog.endDialog(this.context, instance, reason);
                }
                // Pop dialog off stack
                this.stack.pop();
                this.state.setValue(memory_1.TurnPath.lastResult, result);
            }
        });
    }
}
exports.DialogContext = DialogContext;
//# sourceMappingURL=dialogContext.js.map
