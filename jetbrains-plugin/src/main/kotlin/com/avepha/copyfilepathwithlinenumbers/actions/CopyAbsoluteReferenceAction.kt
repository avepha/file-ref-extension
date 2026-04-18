package com.avepha.copyfilepathwithlinenumbers.actions

import com.avepha.copyfilepathwithlinenumbers.reference.ReferenceMode

class CopyAbsoluteReferenceAction : CopyReferenceAction() {
    override val mode: ReferenceMode = ReferenceMode.ABSOLUTE
}
