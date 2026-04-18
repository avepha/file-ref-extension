package com.avepha.copyfilepathwithlinenumbers.actions

import com.avepha.copyfilepathwithlinenumbers.reference.ReferenceMode

class CopyRelativeReferenceAction : CopyReferenceAction() {
    override val mode: ReferenceMode = ReferenceMode.RELATIVE
}
